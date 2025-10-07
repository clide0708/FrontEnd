import { useState, useEffect } from "react";
import AddExercicio from "./addExercicio";
import exerciciosService from "../../services/Treinos/exercicios.jsx";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { IoArrowBackSharp } from "react-icons/io5";
import "./style.css";

export default function EditarTreino({
  treino,
  abaAtiva,
  onVoltar,
  hideIniciar = false,
}) {
  const navigate = useNavigate();

  const [currentTreino, setCurrentTreino] = useState({
    ...treino,
    exercicios: Array.isArray(treino?.exercicios) ? treino.exercicios : [],
  });

  const [selectedExercicio, setSelectedExercicio] = useState(null);
  const [editExercicioTemp, setEditExercicioTemp] = useState(null);
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
                informacoes: [
                  ex.observacoes,
                  isExercicioNormal
                    ? ex.descricaoExercicio
                    : ex.descricaoExercAdaptado,
                  ex.comoExecutar,
                ]
                  .filter(Boolean)
                  .join(" - "),
                _rawData: ex,
              };
            })
          : [];

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: exerciciosFormatados,
        }));

        if (exerciciosFormatados.length > 0) {
          setSelectedExercicio(exerciciosFormatados[0]);
          setEditExercicioTemp(exerciciosFormatados[0]);
        }
      } catch (err) {
        console.error("Erro ao buscar exercícios do treino", err);
        setCurrentTreino((prev) => ({ ...prev, exercicios: [] }));
      }
    };

    fetchExerciciosDoTreino();
  }, [treino]);

  // Quando seleciona outro exercício
  const handleSelectExercicio = (ex) => {
    setSelectedExercicio(ex);
    // reinicia edição temporária
    setEditExercicioTemp(ex);
  };

  // Alterar exercício temporário
  const handleEditChange = (campo, valor) => {
    if (!editExercicioTemp) return;

    setEditExercicioTemp({
      ...editExercicioTemp,
      [campo]: valor,
    });
  };

  // Remover exercício
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
          setEditExercicioTemp(null);
        }
      } catch (err) {
        console.error("Erro ao remover exercício:", err);
        alert("Erro ao remover exercício");
      }
    }
  };

  // Adicionar exercício
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
        // busca tudo de novo do backend pra atualizar corretamente
        const exerciciosAtualizados =
          await exerciciosService.buscarExerciciosDoTreino(treino.idTreino);

        const exerciciosFormatados = Array.isArray(exerciciosAtualizados)
          ? exerciciosAtualizados.map((ex) => {
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
                informacoes: [
                  ex.observacoes,
                  isExercicioNormal
                    ? ex.descricaoExercicio
                    : ex.descricaoExercAdaptado,
                  ex.comoExecutar,
                ]
                  .filter(Boolean)
                  .join(" - "),
                _rawData: ex,
              };
            })
          : [];

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: exerciciosFormatados,
        }));

        if (exerciciosFormatados.length > 0) {
          setSelectedExercicio(
            exerciciosFormatados[exerciciosFormatados.length - 1]
          );
          setEditExercicioTemp(
            exerciciosFormatados[exerciciosFormatados.length - 1]
          );
        }
      }
    } catch (err) {
      console.error("Erro ao adicionar exercício:", err);
      alert("Erro ao adicionar exercício");
    }
  };

  // Salvar todos os exercícios temporários
  const handleSaveTodosExercicios = async () => {
    if (!currentTreino.exercicios.length || isReadOnly) return;

    try {
      // atualiza só o exercício temporário editado
      if (editExercicioTemp) {
        await exerciciosService.atualizarExercicioNoTreino(
          editExercicioTemp.id,
          {
            series: editExercicioTemp.series,
            repeticoes: editExercicioTemp.repeticoes,
            carga: editExercicioTemp.peso,
            descanso: editExercicioTemp.descanso,
            // informacoes/observacoes não é alterado
          }
        );

        // atualiza o state local sem tocar informacoes
        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: prev.exercicios.map((item) =>
            item.id === editExercicioTemp.id
              ? {
                  ...item,
                  series: editExercicioTemp.series,
                  repeticoes: editExercicioTemp.repeticoes,
                  peso: editExercicioTemp.peso,
                  descanso: editExercicioTemp.descanso,
                  // mantem informacoes e outros campos intactos
                }
              : item
          ),
        }));
      }

      alert("Alterações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar exercícios:", err);
      alert("Erro ao salvar exercícios");
    }
  };

  return (
    <div className="editar-treino-container">
      <div className="btnhd">
        <button onClick={onVoltar}>
          <IoArrowBackSharp />
        </button>
        <h2>{currentTreino.nome}</h2>
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
          ) : editExercicioTemp ? (
            <>
              <label>
                Séries:
                <input
                  type="number"
                  value={editExercicioTemp.series || 0}
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
                  value={editExercicioTemp.repeticoes || 0}
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
                  value={editExercicioTemp.peso || 0}
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
                  value={editExercicioTemp.descanso || 0}
                  onChange={(e) =>
                    handleEditChange("descanso", parseInt(e.target.value) || 0)
                  }
                  disabled={isReadOnly}
                />
              </label>
              {editExercicioTemp.informacoes && (
                <p>{editExercicioTemp.informacoes}</p>
              )}
              {editExercicioTemp.url && (
                <a
                  href={editExercicioTemp.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver Vídeo
                </a>
              )}

              {/* botão salvar todos */}
              {!isReadOnly && (
                <button
                  onClick={handleSaveTodosExercicios}
                  className="btnSalvarTodos"
                  style={{ marginTop: "15px" }}
                >
                  Salvar
                </button>
              )}
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
                onClick={() => handleSelectExercicio(ex)}
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
                    <FiTrash2 size={18} />
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
              {!hideIniciar && currentTreino.exercicios.length > 0 && (
                <button
                  onClick={() => {
                    if (currentTreino.exercicios.length === 0) return;
                    navigate("/treinando", {
                      state: { treino: currentTreino },
                    });
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
              )}
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
