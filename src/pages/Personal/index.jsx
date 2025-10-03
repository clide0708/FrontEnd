import { useState, useEffect } from "react";
import "./style.css";
import { Trash2, Plus } from "lucide-react";
import treinosService from "../../services/Personal/personal";
import EditarTreino from "../Treinos/editTreino";

function Personal() {
  const [alunos, setAlunos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [treinosPersonal, setTreinosPersonal] = useState([]); // treinos do personal
  const [treinosAluno, setTreinosAluno] = useState([]); // treinos atribuídos ao aluno

  const [showEditar, setShowEditar] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);

  const idPersonal = 2; // depois pega do token/logged user

  // carrega treinos do personal
  useEffect(() => {
    async function fetchTreinosPersonal() {
      const treinos = await treinosService.getTreinosPersonal(idPersonal);
      setTreinosPersonal(treinos);
    }
    fetchTreinosPersonal();
  }, []);

  // carrega alunos do personal e seleciona o primeiro
  useEffect(() => {
    async function fetchAlunos() {
      const lista = await treinosService.getAlunosPersonal(idPersonal);
      setAlunos(lista);
      if (lista.length > 0) setClienteSelecionado(lista[0]);
    }
    fetchAlunos();
  }, []);

  // carrega treinos do aluno selecionado
  useEffect(() => {
    async function fetchTreinosAluno() {
      if (!clienteSelecionado) return;

      try {
        const treinos = await treinosService.getTreinosAluno(clienteSelecionado.idAluno);
        setTreinosAluno(treinos || []);
      } catch (error) {
        console.error("Erro ao buscar treinos do aluno:", error);
        setTreinosAluno([]);
      }
    }
    fetchTreinosAluno();
  }, [clienteSelecionado]);

  // apagar treino do aluno localmente
  function apagarTreino(treinoId) {
    setTreinosAluno(treinosAluno.filter((t) => t.idTreino !== treinoId));
  }

  // atribuir treino do personal ao aluno
  function atribuirTreinoAoAluno(treino) {
    if (treinosAluno.some((t) => t.idTreino === treino.idTreino)) {
      alert("Esse treino já está atribuído!");
      return;
    }
    setTreinosAluno([...treinosAluno, treino]);
  }

  // salvar alterações feitas pelo Personal no BD
  const handleSaveTreinoPersonal = async (novoTreino) => {
    try {
      // salva no backend
      await treinosService.atualizarTreino(novoTreino.idTreino, novoTreino);

      // atualiza local
      setTreinosAluno((prev) =>
        prev.map((t) => (t.idTreino === novoTreino.idTreino ? novoTreino : t))
      );
      setShowEditar(false);
      setTreinoSelecionado(null);
    } catch (err) {
      console.error("Erro ao salvar treino pelo Personal:", err);
      alert("Erro ao salvar treino");
    }
  };

  return (
    <div className="Personal">
      <div className="containerPS">
        {/* Painel esquerdo */}
        <div className="SC1">
          {clienteSelecionado && (
            <>
              <h4 className="Titulo">{clienteSelecionado.nome}</h4>
              <div className="lnCliente">
                <div className="ftCliente">
                  <img
                    src={clienteSelecionado.img || "/assets/images/profilefoto.png"}
                    alt="Perfil"
                  />
                </div>
                <div className="infCliente">
                  <p><strong className="Clientestrong">Email:</strong> {clienteSelecionado.email}</p>
                  <p><strong className="Clientestrong">Status:</strong> {clienteSelecionado.status_vinculo}</p>
                </div>
              </div>

              <div className="ClienteEX">
                {/* Treinos atribuídos */}
                <div className="clte1">
                  <h1>Treinos atribuídos</h1>
                  <div className="treinosGrid">
                    {treinosAluno.length > 0 ? (
                      treinosAluno.map((treino) => (
                        <div
                          className="treinoCard"
                          key={treino.idTreino}
                          onClick={() => {
                            setTreinoSelecionado(treino);
                            setShowEditar(true);
                          }}
                        >
                          <p>{treino.nome}</p>
                          <div className="acoesTreino">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                apagarTreino(treino.idTreino);
                              }}
                              className="btnIcon delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Nenhum treino atribuído</p>
                    )}
                  </div>
                </div>

                {/* Treinos disponíveis do personal */}
                <div className="clte2">
                  <h1>Atribuir</h1>
                  <div className="treinosGridedede">
                    {treinosPersonal.length > 0 ? (
                      treinosPersonal.map((treino) => (
                        <div
                          className="treinoCard"
                          key={treino.idTreino}
                          onClick={() => {
                            setTreinoSelecionado(treino);
                            setShowEditar(true);
                          }}
                        >
                          <p>{treino.nome}</p>
                          <div className="acoesTreino">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                atribuirTreinoAoAluno(treino);
                              }}
                              className="btnIcon add"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Nenhum treino disponível</p>
                    )}
                  </div>
                  <div className="clttet">
                    <button>Criar Novo</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Painel direito */}
        <div className="SC2">
          <div className="SC2p1">
            <h4 style={{ textAlign: "center" }}>Seu link de convite</h4>
            {clienteSelecionado && (
              <h1>{`📄 https://clidefit.com/invite/${clienteSelecionado.idAluno}`}</h1>
            )}
          </div>

          <div className="SC2p2">
            <h4 style={{ textAlign: "center" }}>Alunos</h4>
            <ul>
              {alunos.length > 0 ? (
                alunos.map((aluno) => (
                  <li
                    key={aluno.idAluno}
                    onClick={() => setClienteSelecionado(aluno)}
                    className={clienteSelecionado?.idAluno === aluno.idAluno ? "selecionado" : ""}
                  >
                    <img
                      className="imgpflpqn"
                      src={aluno.img || "/assets/images/profilefoto.png"}
                      alt="Perfil"
                    />
                    {aluno.nome}
                  </li>
                ))
              ) : (
                <p>Nenhum aluno encontrado</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal EditarTreino */}
      {showEditar && treinoSelecionado && (
        <div className="modal-overlay">
          <div className="editcontttttent">
            <EditarTreino
              treino={treinoSelecionado}
              abaAtiva="Editar"      // força edição pro Personal
              hideIniciar={true}     // esconde botão iniciar
              onVoltar={() => {
                setShowEditar(false);
                setTreinoSelecionado(null);
              }}
              onSave={handleSaveTreinoPersonal}
              onDelete={(id) => {
                setTreinosAluno((prev) => prev.filter((t) => t.idTreino !== id));
                setShowEditar(false);
                setTreinoSelecionado(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Personal;
