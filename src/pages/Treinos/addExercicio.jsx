import { useState, useEffect } from "react";
import exerciciosService from "../../services/Treinos/exercicios";
import exerciciosPersonalService from "../../services/Treinos/exerciciosPersonal";
import AddExercicioPersonal from "./addExercicioPersonal";
import "./style.css";

export default function AddExercicio({
  onAdd,
  onClose,
  tipoTreino = "normal",
}) {
  const [grupo, setGrupo] = useState("");
  const [exercicio, setExercicio] = useState(null);
  const [exerciciosDisponiveis, setExerciciosDisponiveis] = useState([]);
  const [todosExercicios, setTodosExercicios] = useState([]);
  const [meusExercicios, setMeusExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCadastrarExercicio, setShowCadastrarExercicio] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("global");
  const [error, setError] = useState(null);

  const [numSeries, setNumSeries] = useState(3);
  const [numRepeticoes, setNumRepeticoes] = useState(12);
  const [peso, setPeso] = useState("");
  const [descanso, setDescanso] = useState(60);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const isPersonal = usuario.tipo === "personal";

  useEffect(() => {
    const fetchExercicios = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isPersonal) {
          let resGlobal, resPersonal;

          if (tipoTreino === "normal") {
            // Para treino normal: exercícios normais (globais + pessoais)
            resGlobal = await exerciciosService.buscarTodosExerciciosComFiltro('normal');
            resPersonal = await exerciciosPersonalService.buscarMeusExerciciosPorTipo('normal');
          } else {
            // Para treino adaptado: exercícios adaptados (pessoais) + globais normais
            resGlobal = await exerciciosService.buscarTodosExerciciosComFiltro('normal');
            resPersonal = await exerciciosPersonalService.buscarMeusExerciciosPorTipo('adaptado');
          }

          setTodosExercicios(resGlobal || []);
          setMeusExercicios(resPersonal || []);

          // Definir lista inicial
          if (abaAtiva === "global") {
            setExerciciosDisponiveis(resGlobal || []);
          } else {
            setExerciciosDisponiveis(resPersonal || []);
          }
        } else {
          // Aluno: busca apenas exercícios disponíveis para aluno
          let resGlobal;
          
          if (tipoTreino === "normal") {
            resGlobal = await exerciciosService.buscarTodosExerciciosComFiltro('normal');
          } else {
            resGlobal = await exerciciosService.buscarTodosExerciciosComFiltro('normal');
          }
          
          setTodosExercicios(resGlobal || []);
          setMeusExercicios([]);
          setExerciciosDisponiveis(resGlobal || []);
        }
      } catch (error) {
        console.error("Erro ao buscar exercícios:", error);
        setError("Erro ao carregar exercícios. Tente novamente.");
        setTodosExercicios([]);
        setMeusExercicios([]);
        setExerciciosDisponiveis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercicios();
  }, [abaAtiva, isPersonal, tipoTreino]);

  // CORREÇÃO: Filtragem por grupo muscular - FUNCIONANDO
  useEffect(() => {
    let exerciciosFiltrados = [];

    if (abaAtiva === "global") {
      exerciciosFiltrados = todosExercicios;
    } else {
      exerciciosFiltrados = meusExercicios;
    }

    // Aplicar filtro de grupo se selecionado
    if (grupo) {
      exerciciosFiltrados = exerciciosFiltrados.filter(
        (ex) => ex.grupoMuscular && ex.grupoMuscular === grupo
      );
    }

    setExerciciosDisponiveis(exerciciosFiltrados);
    setExercicio(null);
  }, [grupo, todosExercicios, meusExercicios, abaAtiva]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exercicio) return;

    const novoExercicio = {
      ...exercicio,
      id: exercicio.idExercicio || exercicio.idExercAdaptado || exercicio.id,
      series: numSeries,
      repeticoes: numRepeticoes,
      carga: peso ? parseFloat(peso) : 0,
      descanso: descanso ? parseInt(descanso) : 0,
      ordem: 0,
    };

    console.log("Adicionando exercício ao treino:", novoExercicio);
    onAdd(novoExercicio);
    onClose();
  };

  const handleAddExercicioPersonal = (novoExercicio) => {
    setMeusExercicios((prev) => [...prev, novoExercicio]);
    setAbaAtiva("personal");
    setExercicio(novoExercicio);
    setGrupo(novoExercicio.grupoMuscular || "");
  };

  if (loading)
    return <div className="modal-overlay">Carregando exercícios...</div>;

  // CORREÇÃO: Grupos musculares de TODOS os exercícios disponíveis - FUNCIONANDO
  const gruposUnicos = [
    ...new Set([
      ...todosExercicios.map((ex) => ex.grupoMuscular).filter(Boolean),
      ...meusExercicios.map((ex) => ex.grupoMuscular).filter(Boolean),
    ]),
  ].sort();

  return (
    <div className="modal-overlay addExercicio">
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <h2>
          Adicionar Exercício{" "}
          {tipoTreino === "adaptado" ? "Adaptado" : "Normal"}
          <small
            style={{
              display: "block",
              fontSize: "14px",
              color: "#666",
              marginTop: "5px",
            }}
          >
            {tipoTreino === "adaptado"
              ? "Exercícios adaptados para necessidades especiais"
              : "Exercícios convencionais"}
          </small>
        </h2>

        {error && (
          <div
            className="error-message"
            style={{
              background: "#ffe6e6",
              color: "#d63031",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              border: "1px solid #ff7675",
            }}
          >
            {error}
          </div>
        )}

        {isPersonal && (
          <div className="abas-exercicios">
            <button
              type="button"
              className={`aba ${abaAtiva === "global" ? "active" : ""}`}
              onClick={() => {
                setAbaAtiva("global");
                setExerciciosDisponiveis(todosExercicios);
                setGrupo("");
                setExercicio(null);
                setError(null);
              }}
            >
              Exercícios {tipoTreino === "normal" ? "Globais" : "Disponíveis"}
            </button>
            <button
              type="button"
              className={`aba ${abaAtiva === "personal" ? "active" : ""}`}
              onClick={() => {
                setAbaAtiva("personal");
                setExerciciosDisponiveis(meusExercicios);
                setGrupo("");
                setExercicio(null);
                setError(null);
              }}
            >
              Meus Exercícios
            </button>
            <button
              type="button"
              className="aba cadastrar"
              onClick={() => setShowCadastrarExercicio(true)}
            >
              + Cadastrar Novo
            </button>
          </div>
        )}

        {!isPersonal && (
          <div className="info-message">
            <strong>Exercícios Disponíveis:</strong> Lista de exercícios{" "}
            {tipoTreino === "adaptado" ? "adaptados" : "globais"} da plataforma.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Grupo Muscular:</label>
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              disabled={loading}
            >
              <option value="">Todos os grupos musculares</option>
              {gruposUnicos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {gruposUnicos.length === 0 && !loading && (
              <small style={{ color: "#666" }}>
                Nenhum grupo muscular disponível
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Exercício:</label>
            <select
              value={exercicio?.id || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedEx = exerciciosDisponiveis.find(
                  (ex) =>
                    (ex.idExercicio || ex.idExercAdaptado || ex.id) ==
                    selectedId
                );
                setExercicio(selectedEx || null);
              }}
              disabled={exerciciosDisponiveis.length === 0 || loading}
            >
              <option value="" disabled hidden>
                {loading
                  ? "Carregando..."
                  : exerciciosDisponiveis.length > 0
                  ? "Selecione o exercício"
                  : abaAtiva === "global"
                  ? `Nenhum exercício ${tipoTreino} disponível`
                  : "Nenhum exercício pessoal cadastrado"}
              </option>
              {exerciciosDisponiveis.map((ex) => (
                <option
                  key={ex.idExercicio || ex.idExercAdaptado || ex.id}
                  value={ex.idExercicio || ex.idExercAdaptado || ex.id}
                >
                  {ex.nome}
                  {ex.visibilidade === "personal" && " (Meu)"}
                  {ex.tipo_exercicio === "adaptado" && " [Adaptado]"}
                </option>
              ))}
            </select>

            {exerciciosDisponiveis.length === 0 &&
              isPersonal &&
              abaAtiva === "personal" && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#f0f8ff",
                    borderRadius: "4px",
                  }}
                >
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                    {tipoTreino === "adaptado"
                      ? "Você ainda não cadastrou exercícios adaptados."
                      : "Você ainda não cadastrou exercícios pessoais."}
                  </p>
                  <button
                    type="button"
                    className="btn-cadastrar-exercicio"
                    onClick={() => setShowCadastrarExercicio(true)}
                  >
                    Cadastrar Primeiro Exercício
                  </button>
                </div>
              )}
          </div>

          {exercicio && (
            <>
              {exercicio.descricao && (
                <div className="descricao-exercicio">
                  <strong>Descrição:</strong>
                  <p>{exercicio.descricao}</p>
                </div>
              )}

              <div className="configuracoes-treino">
                <h4>Configurações do Treino</h4>

                <div className="linha-configuracoes">
                  <div className="iptex">
                    <label>Séries*</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={numSeries}
                      onChange={(e) =>
                        setNumSeries(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div className="iptex">
                    <label>Repetições*</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={numRepeticoes}
                      onChange={(e) =>
                        setNumRepeticoes(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                </div>

                <div className="linha-configuracoes">
                  <div className="iptex">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="iptex">
                    <label>Descanso (segundos)</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={descanso}
                      onChange={(e) => setDescanso(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {exercicio.video_url && (
                <div className="video-info">
                  <strong>Vídeo disponível:</strong>
                  <a
                    href={exercicio.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#368dd9",
                    }}
                  >
                    Assistir vídeo de execução
                  </a>
                </div>
              )}
            </>
          )}

          <div className="btns-add-ex">
            <button type="button" className="clcbt" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="mdnbt"
              disabled={!exercicio || loading}
            >
              Adicionar ao Treino
            </button>
          </div>
        </form>
      </div>

      {showCadastrarExercicio && (
        <AddExercicioPersonal
          onAdd={handleAddExercicioPersonal}
          onClose={() => setShowCadastrarExercicio(false)}
          tipoTreino={tipoTreino}
        />
      )}
    </div>
  );
}
