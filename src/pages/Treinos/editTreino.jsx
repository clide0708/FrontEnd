import { useState, useEffect } from "react";
import AddExercicio from "./addExercicio";
import exerciciosService from "../../services/Treinos/exercicios";
import treinosService from "../../services/Treinos/treinos";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);

  const isReadOnly = abaAtiva === "Personal";

  // Buscar exercícios do treino
  useEffect(() => {
    const fetchExerciciosDoTreino = async () => {
      if (!treino || !treino.idTreino) return;
      
      try {
        setLoading(true);
        console.log("Buscando exercícios do treino:", treino.idTreino);
        
        const res = await exerciciosService.buscarExerciciosDoTreino(treino.idTreino);
        console.log("Exercícios retornados da API:", res);
        
        // CORREÇÃO: Garantir que os vídeos estejam incluídos
        const exerciciosFormatados = Array.isArray(res) ? res.map(ex => ({
          ...ex,
          // Garantir que a URL do vídeo esteja disponível
          url: ex.video_url || ex.url || "",
          // Garantir que as propriedades necessárias para o treinando.jsx existam
          series: ex.series || 0,
          repeticoes: ex.repeticoes || 0,
          descanso: ex.descanso || 0,
          carga: ex.carga || 0,
          grupo: ex.grupoMuscular || "",
          informacoes: ex.descricao || ex.informacoes || "",
        })) : [];
        
        console.log("Exercícios formatados com vídeos:", exerciciosFormatados);

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: exerciciosFormatados,
          tipo_treino: treino.tipo_treino || 'normal'
        }));

        if (exerciciosFormatados.length > 0) {
          setSelectedExercicio(exerciciosFormatados[0]);
          setEditExercicioTemp(exerciciosFormatados[0]);
        } else {
          setSelectedExercicio(null);
          setEditExercicioTemp(null);
        }
      } catch (err) {
        console.error("Erro ao buscar exercícios do treino", err);
        setCurrentTreino((prev) => ({ ...prev, exercicios: [] }));
      } finally {
        setLoading(false);
      }
    };

    fetchExerciciosDoTreino();
  }, [treino]);


  // Quando seleciona outro exercício
  const handleSelectExercicio = (ex) => {
    setSelectedExercicio(ex);
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

  // Adicionar exercício - CORREÇÃO
  const handleAddExercicio = async (novoEx) => {
    if (!treino?.idTreino) return;

    try {
      console.log("Adicionando exercício:", novoEx);
      
      const resultado = await exerciciosService.adicionarExercicioAoTreino(
        treino.idTreino,
        novoEx
      );

      console.log("Resultado da adição:", resultado);

      if (resultado.success !== false) {
        // CORREÇÃO: Buscar exercícios atualizados do backend
        const exerciciosAtualizados = await exerciciosService.buscarExerciciosDoTreino(treino.idTreino);
        console.log("Exercícios atualizados:", exerciciosAtualizados);

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: Array.isArray(exerciciosAtualizados) ? exerciciosAtualizados : [],
        }));

        if (exerciciosAtualizados.length > 0) {
          const ultimoExercicio = exerciciosAtualizados[exerciciosAtualizados.length - 1];
          setSelectedExercicio(ultimoExercicio);
          setEditExercicioTemp(ultimoExercicio);
        }
        
        // Fechar modal de adicionar
        setShowAdd(false);
      } else {
        alert("Erro ao adicionar exercício: " + (resultado.error || "Erro desconhecido"));
      }
    } catch (err) {
      console.error("Erro ao adicionar exercício:", err);
      alert("Erro ao adicionar exercício: " + err.message);
    }
  };

  const handleIniciarTreino = async () => {
    if (currentTreino.exercicios.length === 0) return;  // Mantém a verificação original
    
    try {
      // Chama o backend para criar a sessão
      const response = await treinosService.criarSessao(currentTreino.idTreino);
      const idSessao = response.idSessao;  // Extrai o ID da sessão da resposta
      
      // Preparação de dados como na sua função original
      const treinoParaExecutar = {
        ...currentTreino,
        idSessao: idSessao,  // Adiciona o ID da sessão ao objeto
        exercicios: currentTreino.exercicios.map(ex => ({
          ...ex,
          id: ex.id || ex.idTreino_Exercicio,
          series: ex.series || 3,
          repeticoes: ex.repeticoes || 10,
          descanso: ex.descanso || 60,
          carga: ex.carga || 0,
          url: ex.video_url || ex.url || "",
          grupo: ex.grupoMuscular || ex.grupo || "",
          informacoes: ex.descricao || ex.informacoes || "",
        }))
      };
      
      console.log("Treino para executar:", treinoParaExecutar);
      
      navigate("/treinando", {
        state: { treino: treinoParaExecutar },  // Navega com o treino atualizado
      });
    } catch (err) {
      console.error("Erro ao iniciar treino:", err);
      // Opcional: Adicione um alerta ou mensagem para o usuário, ex:
      alert("Não foi possível iniciar o treino. Tente novamente.");
    }
  };

  // Salvar todos os exercícios temporários
  const handleSaveTodosExercicios = async () => {
    if (!currentTreino.exercicios.length || isReadOnly) return;

    try {
      if (editExercicioTemp) {
        await exerciciosService.atualizarExercicioNoTreino(
          editExercicioTemp.id,
          {
            series: editExercicioTemp.series,
            repeticoes: editExercicioTemp.repeticoes,
            carga: editExercicioTemp.carga,
            descanso: editExercicioTemp.descanso,
            ordem: editExercicioTemp.ordem || 0,
          }
        );

        setCurrentTreino((prev) => ({
          ...prev,
          exercicios: prev.exercicios.map((item) =>
            item.id === editExercicioTemp.id
              ? {
                  ...item,
                  series: editExercicioTemp.series,
                  repeticoes: editExercicioTemp.repeticoes,
                  carga: editExercicioTemp.carga,
                  descanso: editExercicioTemp.descanso,
                  ordem: editExercicioTemp.ordem || 0,
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
    <div className="editTreino editar-treino-container">
      <div className="btnhd">
        <button onClick={onVoltar}>← Voltar</button>
        <h2>
          {currentTreino.nome}
          {currentTreino.tipo_treino === 'adaptado' && (
            <span className="badge-adaptado">Adaptado</span>
          )}
        </h2>
      </div>

      {loading && <div>Carregando exercícios...</div>}

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
                  step="0.01"
                  value={editExercicioTemp.carga || 0}
                  onChange={(e) =>
                    handleEditChange("carga", parseFloat(e.target.value) || 0)
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
                <p>Informações: {editExercicioTemp.informacoes}</p>
              )}
              {editExercicioTemp.video_url && (
                <a
                  href={editExercicioTemp.video_url}
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
                  Salvar Todos
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
                {ex.tipo_exercicio === 'adaptado' && ' [Adaptado]'}
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
              {!hideIniciar && currentTreino.exercicios.length > 0 && (
                <button
                  onClick={handleIniciarTreino}
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
          tipoTreino={currentTreino.tipo_treino || 'normal'}
        />
      )}
    </div>
  );
}