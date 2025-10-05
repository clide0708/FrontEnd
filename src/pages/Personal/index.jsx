import { useState, useEffect } from "react";
import "./style.css";
import { FiEdit } from "react-icons/fi";
import { Trash2, Plus } from "lucide-react";
import personalService from "../../services/Personal/personal";
import treinosService from "../../services/Treinos/treinos.jsx"; // criar/editar

import EditarTreino from "../Treinos/editTreino";
import ModalAddTreino from "../Treinos/addTreino";

function Personal() {
  const [alunos, setAlunos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [treinosPersonal, setTreinosPersonal] = useState([]);
  const [treinosAluno, setTreinosAluno] = useState([]);
  const [treinoEditando, setTreinoEditando] = useState(null);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);

  const idPersonal = 2; // depois pega do token/logged user

  // carrega treinos do personal
  useEffect(() => {
    async function fetchTreinosPersonal() {
      const treinos = await personalService.getTreinosPersonal(idPersonal);
      setTreinosPersonal(treinos || []);
    }
    fetchTreinosPersonal();
  }, []);

  // carrega alunos do personal
  useEffect(() => {
    async function fetchAlunos() {
      const lista = await personalService.getAlunosPersonal(idPersonal);
      setAlunos(lista || []);
      if (lista.length > 0) setClienteSelecionado(lista[0]);
    }
    fetchAlunos();
  }, []);

  // carrega treinos do aluno selecionado
  useEffect(() => {
    async function fetchTreinosAluno() {
      if (!clienteSelecionado) return;
      try {
        const treinos = await personalService.getTreinosAluno(
          clienteSelecionado.idAluno
        );
        setTreinosAluno(treinos || []);
      } catch (err) {
        console.error("Erro ao buscar treinos do aluno:", err);
        setTreinosAluno([]);
      }
    }
    fetchTreinosAluno();
  }, [clienteSelecionado]);

  // atribuir treino ao aluno
  async function atribuirTreinoAoAluno(treino) {
    if (!clienteSelecionado) return;
    if (treinosAluno.some((t) => t.idTreino === treino.idTreino)) {
      alert("Esse treino já está atribuído!");
      return;
    }
    try {
      await personalService.atribuirTreino(
        treino.idTreino,
        clienteSelecionado.idAluno
      );
      // atualiza lista do aluno
      const treinosAtualizados = await personalService.getTreinosAluno(
        clienteSelecionado.idAluno
      );
      setTreinosAluno(treinosAtualizados || []);
    } catch (err) {
      console.error(err);
      alert("Erro ao atribuir treino");
    }
  }

  // desatribuir treino do aluno
  async function handleDesatribuirTreino(treino) {
    if (!treino?.idTreino) return;
    try {
      await personalService.desatribuirTreino(treino.idTreino);
      setTreinosAluno((prev) =>
        prev.filter((t) => t.idTreino !== treino.idTreino)
      );
    } catch (err) {
      console.error(err);
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
                    {treinosAluno.map((treino) => (
                      <div
                        className="treinoCard"
                        key={treino.idAtribuicao}
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
                              setTreinoEditando(treino);
                              setShowModalAdd(true);
                            }}
                            className="btnIcon edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDesatribuirTreino(treino);
                            }}
                            className="btnIcon delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Treinos do personal */}
                <div className="clte2">
                  <h1>Atribuir</h1>
                  <div className="treinosGridedede">
                    {treinosPersonal.map((treino) => (
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
                    ))}
                  </div>
                  <div className="clttet">
                    <button
                      onClick={() => {
                        setTreinoEditando(null); // modal vazio pra criar
                        setShowModalAdd(true);
                      }}
                    >
                      Criar Novo
                    </button>
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
              {alunos.map((aluno) => (
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
              ))}
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
              treinoId={
                treinoSelecionado.idAtribuicao || treinoSelecionado.idTreino
              }
              abaAtiva="Editar"
              hideIniciar={true}
              onVoltar={() => {
                setShowEditar(false);
                setTreinoSelecionado(null);
              }}
              onDelete={(id) => {
                setTreinosAluno((prev) =>
                  prev.filter((t) => t.idAtribuicao !== id)
                );
                setShowEditar(false);
                setTreinoSelecionado(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de editar nome (ModalAddTreino) */}
      {showModalAdd && (
        <ModalAddTreino
          treino={treinoEditando}
          onClose={() => {
            setShowModalAdd(false);
            setTreinoEditando(null);
          }}
          onSave={async (novoTreino) => {
            if (novoTreino.idTreino) {
              await treinosService.editar(novoTreino);
            } else {
              await treinosService.criar(novoTreino);
            }

            // atualiza treinos do personal
            const treinosAtualizados = await personalService.getTreinosPersonal(idPersonal);
            setTreinosPersonal(treinosAtualizados || []);

            // atualiza treinos do aluno se ele tiver o treino editado
            setTreinosAluno(prev =>
              prev.map(t => t.idTreino === novoTreino.idTreino ? { ...t, ...novoTreino } : t)
            );

            setShowModalAdd(false);
            setTreinoEditando(null);
          }}
        />
      )}
    </div>
  );
}

export default Personal;
