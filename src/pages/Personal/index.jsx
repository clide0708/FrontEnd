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
        const treinos = await treinosService.getTreinosAluno(
          clienteSelecionado.idAluno
        );
        setTreinosAluno(treinos || []);
      } catch (error) {
        console.error("Erro ao buscar treinos do aluno:", error);
        setTreinosAluno([]);
      }
    }
    fetchTreinosAluno();
  }, [clienteSelecionado]);

  // apagar treino do aluno localmente
  async function apagarTreino(treino) {
    if (!treino.idAtribuicao && !treino.idTreino) {
      alert("ID do treino inválido");
      return;
    }

    try {
      await treinosService.desatribuirTreino(
        treino.idAtribuicao || treino.idTreino
      );
      setTreinosAluno((prev) =>
        prev.filter((t) => t.idTreino !== treino.idTreino)
      );
    } catch (error) {
      alert("Erro ao desatribuir treino");
      console.error(error);
    }
  }

  // atribuir treino do personal ao aluno
  async function atribuirTreinoAoAluno(treino) {
    if (!clienteSelecionado) return;

    if (treinosAluno.some((t) => t.idTreino === treino.idTreino)) {
      alert("Esse treino já está atribuído!");
      return;
    }

    try {
      await treinosService.atribuirTreino(
        treino.idTreino,
        clienteSelecionado.idAluno
      );

      setTreinosAluno((prev) => [...prev, treino]);
    } catch (error) {
      alert("Erro ao atribuir treino");
      console.error(error);
    }
  }

  async function handleDesatribuirTreino(treino) {
    if (!treino?.idTreino) {
      console.error("ID do treino inválido:", treino);
      return;
    }

    try {
      await treinosService.desatribuirTreino(treino.idTreino);
      setTreinosAluno((prev) =>
        prev.filter((t) => t.idTreino !== treino.idTreino)
      );
    } catch (error) {
      console.error("Erro ao desatribuir treino:", error);
    }
  }

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
                    src={
                      clienteSelecionado.img || "/assets/images/profilefoto.png"
                    }
                    alt="Perfil"
                  />
                </div>
                <div className="infCliente">
                  <p>
                    <strong className="Clientestrong">Email:</strong>{" "}
                    {clienteSelecionado.email}
                  </p>
                  <p>
                    <strong className="Clientestrong">Status:</strong>{" "}
                    {clienteSelecionado.status_vinculo}
                  </p>
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
                                handleDesatribuirTreino(treino); // passa o objeto inteiro
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
                    className={
                      clienteSelecionado?.idAluno === aluno.idAluno
                        ? "selecionado"
                        : ""
                    }
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
              abaAtiva="Editar" // força edição pro Personal
              hideIniciar={true} // esconde botão iniciar
              onVoltar={() => {
                setShowEditar(false);
                setTreinoSelecionado(null);
              }}
              onDelete={(id) => {
                setTreinosAluno((prev) =>
                  prev.filter((t) => t.idTreino !== id)
                );
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
