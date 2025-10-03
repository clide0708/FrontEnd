import { useState, useEffect } from "react";
import AddExercicio from "./addExercicio";
import exerciciosService from "../../services/Treinos/exercicios.jsx";
import { useNavigate } from "react-router-dom";
import "./style.css";

export default function EditarTreino({
  treino,
  abaAtiva,
  onVoltar,
  onSave,
  onDelete,
}) {
  const navigate = useNavigate();

  const [currentTreino, setCurrentTreino] = useState({
    ...treino,
    exercicios: Array.isArray(treino?.exercicios) ? treino.exercicios : [],
  });

  const [selectedExercicio, setSelectedExercicio] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const isReadOnly = abaAtiva === "Personal";

  // Buscar exercícios do treino
  useEffect(() => {
    const fetchExerciciosDoTreino = async () => {
      if (!treino || !treino.idTreino) return;
      try {
        const res = await exerciciosService.buscarExerciciosDoTreino(
          treino.idTreino
        );

        const exerciciosFormatados = Array.isArray(res)
          ? res.map((ex) => {
              const isExercicioNormal = ex.idExercicio !== null;

              return {
                id: ex.idTreino_Exercicio,
                idExercicio: ex.idExercicio,
                idExercAdaptado: ex.idExercAdaptado,
                nome: isExercicioNormal
                  ? ex.nomeExercicio
                  : ex.nomeExercAdaptado,
                descricao: isExercicioNormal
                  ? ex.descricaoExercicio
                  : ex.descricaoExercAdaptado,
                grupoMuscular: isExercicioNormal
                  ? ex.grupoMuscularExercicio
                  : ex.grupoMuscularExercAdaptado,
                series: ex.series || 0,
                repeticoes: ex.repeticoes || 0,
                peso: ex.carga || 0,
                descanso: ex.descanso || 0,
                url: ex.video_url,
                // concatena todas as informações relevantes
                informacoes: [
                  ex.observacoes,
                  isExercicioNormal
                    ? ex.descricaoExercicio
                    : ex.descricaoExercAdaptado,
                  ex.comoExecutar, // esse é o campo que tava sumindo
                ]
                  .filter(Boolean)
                  .join(" - "),
                _rawData: ex, // útil pra debug
              };
            })
          : [];

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: exerciciosFormatados,
        }));

        if (exerciciosFormatados.length > 0) {
          setSelectedExercicio(exerciciosFormatados[0]);
        }
      } catch (err) {
        console.error("Erro ao buscar exercícios do treino", err);
        setCurrentTreino((prev) => ({ ...prev, exercicios: [] }));
      }
    };

    fetchExerciciosDoTreino();
  }, [treino]);

  // Editar exercício selecionado
  const handleEditChange = (campo, valor) => {
    if (!selectedExercicio) return;

    const exercicioAtualizado = {
      ...selectedExercicio,
      [campo]: valor,
    };

    setSelectedExercicio(exercicioAtualizado);

    setCurrentTreino((prev) => ({
      ...prev,
      exercicios: prev.exercicios.map((ex) =>
        ex.id === selectedExercicio.id ? exercicioAtualizado : ex
      ),
    }));
  };

  const handleRemoveExercicio = async (id) => {
    if (!isReadOnly) {
      try {
        await exerciciosService.removerExercicioDoTreino(id);

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: prev.exercicios.filter((ex) => ex.id !== id),
        }));

        if (selectedExercicio?.id === id) {
          setSelectedExercicio(null);
        }
      } catch (err) {
        console.error("Erro ao remover exercício:", err);
        alert("Erro ao remover exercício");
      }
    }
  };

  const handleAddExercicio = async (novoEx) => {
    if (!treino?.idTreino) return;

    try {
      const resultado = await exerciciosService.adicionarExercicioAoTreino(
        treino.idTreino,
        {
          idExercicio: novoEx.idExercicio || novoEx.id,
          series: novoEx.series || 3,
          repeticoes: novoEx.repeticoes || 10,
          carga: novoEx.peso || 0,
          observacoes: novoEx.informacoes || "",
        }
      );

      if (resultado.success !== false) {
        const exercicioAdicionado = {
          id: resultado.idTreino_Exercicio || Date.now(),
          idExercicio: novoEx.idExercicio || novoEx.id,
          idExercAdaptado: novoEx.idExercAdaptado || null,
          nome: novoEx.nome,
          descricao: novoEx.descricao || "",
          grupoMuscular: novoEx.grupoMuscular || "",
          series: novoEx.series || 3,
          repeticoes: novoEx.repeticoes || 10,
          peso: novoEx.peso || 0,
          descanso: novoEx.descanso || 0,
          observacoes: novoEx.informacoes || "",
          informacoes: novoEx.informacoes || "",
          url: novoEx.url || "",
          _rawData: novoEx,
        };

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: [...prev.exercicios, exercicioAdicionado],
        }));

        setSelectedExercicio(exercicioAdicionado);
      }
    } catch (err) {
      console.error("Erro ao adicionar exercício:", err);
      alert("Erro ao adicionar exercício");
    }
  };

  const handleSaveExercicio = async () => {
    if (!selectedExercicio || isReadOnly) return;

    try {
      await exerciciosService.atualizarExercicioNoTreino(selectedExercicio.id, {
        series: selectedExercicio.series,
        repeticoes: selectedExercicio.repeticoes,
        carga: selectedExercicio.peso,
        observacoes: selectedExercicio.informacoes,
      });

      alert("Exercício atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar exercício:", err);
      alert("Erro ao atualizar exercício");
    }
  };

  return (
    <div className="editar-treino-container">
      <div className="btnhd">
        <button onClick={onVoltar}>← Voltar</button>
        <h2>{currentTreino.nome}</h2>
        {/* {selectedExercicio && !isReadOnly && (
          <button onClick={handleSaveExercicio}>Salvar Alterações</button>
        )} */}
      </div>

      <div className="headertrn">
        <h3
          className={
            currentTreino.exercicios.length === 0 ? "empty-exercicio" : ""
          }
        >
          {selectedExercicio
            ? selectedExercicio.nome
            : currentTreino.exercicios.length === 0
            ? "Nenhum exercício adicionado"
            : "Selecione um exercício"}
        </h3>
        <h2>Exercícios ({currentTreino.exercicios.length})</h2>
      </div>

      <div className="treino-content">
        <div className="editor-exercicio">
          {currentTreino.exercicios.length === 0 ? (
            <h1 className="asdoasd">Adicione um exercício</h1>
          ) : selectedExercicio ? (
            <>
              <label>
                Séries:
                <input
                  type="number"
                  value={selectedExercicio.series || 0}
                  onChange={(e) =>
                    handleEditChange("series", parseInt(e.target.value) || 0)
                  }
                  disabled={isReadOnly}
                />
              </label>
              <label>
                Repetições:
                <input
                  type="number"
                  value={selectedExercicio.repeticoes || 0}
                  onChange={(e) =>
                    handleEditChange(
                      "repeticoes",
                      parseInt(e.target.value) || 0
                    )
                  }
                  disabled={isReadOnly}
                />
              </label>
              <label>
                Peso (kg):
                <input
                  type="number"
                  value={selectedExercicio.peso || 0}
                  onChange={(e) =>
                    handleEditChange("peso", parseFloat(e.target.value) || 0)
                  }
                  disabled={isReadOnly}
                />
              </label>
              <label>
                Descanso (s):
                <input
                  type="number"
                  value={selectedExercicio.descanso || 0}
                  onChange={(e) =>
                    handleEditChange("descanso", parseInt(e.target.value) || 0)
                  }
                  disabled={isReadOnly}
                />
              </label>
              {selectedExercicio.informacoes && (
                <p>Informações: {selectedExercicio.informacoes}</p>
              )}
              {selectedExercicio.url && (
                <a
                  href={selectedExercicio.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver Vídeo
                </a>
              )}
              {/* {selectedExercicio && !isReadOnly && (
                <button
                  onClick={handleSaveExercicio}
                  style={{ marginTop: "10px", padding: "8px 16px" }}
                >
                  Salvar Alterações
                </button>
              )} */}
            </>
          ) : (
            <p>Selecione um exercício da lista para editar</p>
          )}
        </div>

        <div className="lista-exercicios">
          <ul>
            {currentTreino.exercicios.map((ex) => (
              <li
                key={ex.id}
                className={
                  selectedExercicio?.id === ex.id ? "active-exercicio" : ""
                }
                onClick={() => !isReadOnly && setSelectedExercicio(ex)}
              >
                {ex.nome}
                {!isReadOnly && (
                  <button
                    className="dltaex"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExercicio(ex.id);
                    }}
                  >
                    X
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="ftltex">
            {!isReadOnly && (
              <button className="addexbtn" onClick={() => setShowAdd(true)}>
                Adicionar exercício +
              </button>
            )}
            <div className="bttcmc">
              <button
                onClick={() => {
                  if (currentTreino.exercicios.length === 0) return; // previne clique se vazio
                  console.log("Iniciando treino:", currentTreino);
                  navigate("/treinando", { state: { treino: currentTreino } });
                }}
                disabled={currentTreino.exercicios.length === 0}
                style={{
                  opacity: currentTreino.exercicios.length === 0 ? 0.5 : 1,
                  cursor:
                    currentTreino.exercicios.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Iniciar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAdd && !isReadOnly && (
        <AddExercicio
          onAdd={handleAddExercicio}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
