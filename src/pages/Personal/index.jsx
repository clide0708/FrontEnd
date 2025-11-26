import { useState, useEffect } from "react";
import "./style.css";
import { FiEdit } from "react-icons/fi";
import { Trash2, Plus, User, Mail, Phone, Target, Ruler, Calendar, Building } from "lucide-react";
import personalService from "../../services/Personal/personal";
import treinosService from "../../services/Treinos/treinos";
import InviteModal from "../Personal/modalConvite.jsx";
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // 🔥 CORREÇÃO: Adicionar estados de loading e error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idPersonal = usuario?.id;

  // carrega treinos do personal
  useEffect(() => {
    async function fetchTreinosPersonal() {
      try {
        const treinos = await personalService.getTreinosPersonal(idPersonal);
        setTreinosPersonal(treinos || []);
      } catch (err) {
        console.error("Erro ao buscar treinos do personal:", err);
        setTreinosPersonal([]);
      }
    }
    
    if (idPersonal) {
      fetchTreinosPersonal();
    }
  }, [idPersonal]);

  // carrega alunos do personal
  useEffect(() => {
    async function fetchAlunos() {
      if (!idPersonal) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("🎯 Iniciando busca de alunos...");
        const lista = await personalService.getAlunosPersonal(idPersonal);
        console.log("✅ Alunos recebidos:", lista);
        
        setAlunos(lista || []);
        if (lista.length > 0) {
          setClienteSelecionado(lista[0]);
        }
      } catch (err) {
        console.error("❌ Erro ao buscar alunos:", err);
        setError("Erro ao carregar alunos. Tente novamente.");
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAlunos();
  }, [idPersonal]);

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
      
      alert("Treino atribuído com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atribuir treino");
    }
  }

  // desatribuir treino do aluno
  async function handleDesatribuirTreino(treino) {
    if (!treino?.idTreino) return;
    
    const confirmar = window.confirm(
      `Tem certeza que deseja desatribuir o treino "${treino.nome}"?\n\n` +
      `⚠️  Se o aluno já executou este treino, o histórico não será mantido.`
    );
    
    if (!confirmar) return;
    
    try {
      await personalService.desatribuirTreino(treino.idTreino);
      setTreinosAluno((prev) =>
        prev.filter((t) => t.idTreino !== treino.idTreino)
      );
      alert('Treino desatribuído com sucesso!');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Erro ao desatribuir treino');
    }
  }

  // Função auxiliar para calcular idade
  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;
    
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }

  return (
    <div className="Personal">
      <div className="containerPS">
        {/* Painel esquerdo */}
        <div className="SC1">
          {loading && <div className="loading">Carregando alunos...</div>}
          {error && <div className="error-message">{error}</div>}
          
          {clienteSelecionado && !loading && (
            <>
              <div className="tituloDesvincular">
                <h4 className="Titulo">{clienteSelecionado.nome}</h4>
                <button
                  className="btnDesvincular"
                  onClick={async () => {
                    const confirmar = window.confirm(
                      `Tem certeza que deseja desvincular ${clienteSelecionado.nome}?`
                    );
                    if (!confirmar) return;

                    try {
                      await personalService.desvincularAluno(
                        idPersonal,
                        clienteSelecionado.idAluno
                      );
                      alert("Aluno desvinculado com sucesso!");

                      // remove aluno da lista local e limpa seleção
                      setAlunos((prev) =>
                        prev.filter(
                          (a) => a.idAluno !== clienteSelecionado.idAluno
                        )
                      );
                      setClienteSelecionado(null);
                      setTreinosAluno([]);
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao desvincular aluno");
                    }
                  }}
                >
                  Desvincular
                </button>
              </div>

              {/* Informações detalhadas do aluno */}
              <div className="lnCliente">
                <div className="ftCliente">
                  <img
                    src={
                      clienteSelecionado.foto_perfil || "/assets/images/profilefoto.png"
                    }
                    alt="Perfil"
                  />
                </div>
                <div className="infCliente">
                  <p><Mail size={16} /> <strong>Email:</strong> {clienteSelecionado.email}</p>
                  <p><User size={16} /> <strong>Status:</strong> {clienteSelecionado.status_vinculo}</p>
                  {clienteSelecionado.data_nascimento && (
                    <p><Calendar size={16} /> <strong>Idade:</strong> {calcularIdade(clienteSelecionado.data_nascimento)} anos</p>
                  )}
                  {clienteSelecionado.genero && (
                    <p><User size={16} /> <strong>Gênero:</strong> {clienteSelecionado.genero}</p>
                  )}
                  {clienteSelecionado.altura && (
                    <p><Ruler size={16} /> <strong>Altura:</strong> {clienteSelecionado.altura}cm</p>
                  )}
                  {clienteSelecionado.peso && (
                    <p><Target size={16} /> <strong>Peso:</strong> {clienteSelecionado.peso}kg</p>
                  )}
                  {clienteSelecionado.meta && (
                    <p><Target size={16} /> <strong>Meta:</strong> {clienteSelecionado.meta}</p>
                  )}
                  {clienteSelecionado.treinos_adaptados !== undefined && (
                    <p>🎯 <strong>Treinos Adaptados:</strong> {clienteSelecionado.treinos_adaptados ? 'Sim' : 'Não'}</p>
                  )}
                  {clienteSelecionado.academia_nome && (
                    <p><Building size={16} /> <strong>Academia:</strong> {clienteSelecionado.academia_nome}</p>
                  )}
                  
                  {/* Modalidades do aluno */}
                  {clienteSelecionado.modalidades && clienteSelecionado.modalidades.length > 0 && (
                    <div className="modalidades-aluno">
                      <strong>Modalidades:</strong>
                      <div className="modalidades-tags">
                        {clienteSelecionado.modalidades.map((modalidade, index) => (
                          <span key={index} className="modalidade-tag">
                            {modalidade.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                      ))
                    ) : (
                      <div className="empty-treinos">
                        <p>Nenhum treino atribuído</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Treinos do personal */}
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
                      <div className="empty-treinos">
                        <p>Nenhum treino criado</p>
                      </div>
                    )}
                  </div>
                  <div className="clttet">
                    <button
                      onClick={() => {
                        setTreinoEditando(null);
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

          {!clienteSelecionado && !loading && alunos.length === 0 && (
            <div className="empty-state">
              <h3>Nenhum aluno encontrado</h3>
              <p>Convide alunos para começar a gerenciar seus treinos.</p>
            </div>
          )}
        </div>

        {/* Painel direito */}
        <div className="SC2">
          <div className="SC2p1">
            <h4 style={{ textAlign: "center" }}>Enviar convite</h4>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btnAbrirModalConvite"
            >
              Convidar
            </button>
          </div>

          <div className="SC2p2">
            <h4 style={{ textAlign: "center" }}>Alunos ({alunos.length})</h4>
            {alunos.length > 0 ? (
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
                      src={aluno.foto_perfil || "/assets/images/profilefoto.png"}
                      alt="Perfil"
                    />
                    <div className="aluno-info">
                      <span className="aluno-nome">{aluno.nome}</span>
                      {aluno.meta && (
                        <small className="aluno-meta">{aluno.meta}</small>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-alunos">
                <p>Nenhum aluno vinculado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal EditarTreino */}
      {showEditar && treinoSelecionado && (
        <div className="modal-overlay">
          <div className="editcontttttent">
            <EditarTreino
              treino={treinoSelecionado}
              treinoId={treinoSelecionado.idTreino}
              abaAtiva="Editar"
              hideIniciar={true}
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

      {/* Modal de editar nome (ModalAddTreino) */}
      {showModalAdd && (
        <ModalAddTreino
          treino={treinoEditando}
          onClose={() => {
            setShowModalAdd(false);
            setTreinoEditando(null);
          }}
          onSave={async (novoTreino) => {
            try {
              let treinoSalvo;
              if (novoTreino.idTreino) {
                treinoSalvo = await treinosService.editar(novoTreino);
              } else {
                treinoSalvo = await treinosService.criar(novoTreino);
              }

              // atualiza treinos do personal
              const treinosAtualizados = await personalService.getTreinosPersonal(idPersonal);
              setTreinosPersonal(treinosAtualizados || []);

              setShowModalAdd(false);
              setTreinoEditando(null);
            } catch (err) {
              console.error("Erro ao salvar treino:", err);
              alert("Erro ao salvar treino");
            }
          }}
        />
      )}

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

export default Personal;