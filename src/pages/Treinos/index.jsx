import { useState, useEffect } from "react";
import "./style.css";
import EditarTreino from "./editTreino";
import ModalAddTreino from "./addTreino";
import treinosService from "../../services/Treinos/treinos";
import { FiEdit, FiTrash2 } from "react-icons/fi";

function Treinos() {
    const [activeTab, setActiveTab] = useState("Meus Treinos");
    const [fade, setFade] = useState(true);
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [treinoEditando, setTreinoEditando] = useState(null);
    const [treinos, setTreinos] = useState({
        "Meus Treinos": [],
        "Treinos Atribuídos": [],
        Personal: [],
        MarketPlace: [],
    });

    const treinosDaAbaAtual = treinos[activeTab] || [];
    const [showEditar, setShowEditar] = useState(false);
    const [treinoSelecionado, setTreinoSelecionado] = useState(null);

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const getAbas = () => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        
        if (usuario.tipo === "personal") {
            return ["Meus Treinos", "Treinos Atribuídos", "MarketPlace"];
        } else {
            return ["Meus Treinos", "Personal", "MarketPlace"];
        }
    };

    const abas = getAbas();

    const carregarTreinos = async () => {
        try {
            console.log("Carregando treinos para aba:", activeTab);
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            
            if (activeTab === "Meus Treinos") {
            const data = await treinosService.listarMeus();
            console.log("Meus treinos:", data);
            setTreinos((prev) => ({ 
                ...prev, 
                "Meus Treinos": Array.isArray(data) ? data : [] 
            }));
            
            } else if (activeTab === "Treinos Atribuídos" && usuario.tipo === "personal") {
            // ✅ CORREÇÃO: Buscar treinos atribuídos do personal
            const data = await treinosService.listarAtribuidos();
            console.log("Treinos atribuídos:", data);
            setTreinos((prev) => ({ 
                ...prev, 
                "Treinos Atribuídos": Array.isArray(data) ? data : [] 
            }));
            
            } else if (activeTab === "Personal" && usuario.tipo === "aluno") {
            const data = await treinosService.listarTreinosPersonalDoAluno();
            console.log("Treinos do personal (aluno):", data);
            setTreinos((prev) => ({ 
                ...prev, 
                Personal: Array.isArray(data) ? data : [] 
            }));
            
            } else if (activeTab === "MarketPlace") {
            setTreinos((prev) => ({ ...prev, MarketPlace: [] }));
            }
        } catch (err) {
            console.error("Erro ao carregar treinos:", err);
            // ✅ CORREÇÃO: Garantir que não fique undefined em caso de erro
            setTreinos((prev) => ({ 
            ...prev, 
            [activeTab]: [] 
            }));
        }
    };

  useEffect(() => {
    carregarTreinos();
  }, [activeTab]);

  

  const handleSaveTreino = async (novoTreino) => {
    try {
      let treinoSalvo;
      if (novoTreino.idTreino) {
        treinoSalvo = await treinosService.editar(novoTreino);
      } else {
        treinoSalvo = await treinosService.criar(novoTreino);
      }

      setTreinos((prev) => {
        const lista = prev[activeTab];
        const index = lista.findIndex(
          (t) => t.idTreino === treinoSalvo.idTreino
        );

        let novaLista;
        if (index >= 0) {
          novaLista = [...lista];
          novaLista[index] = treinoSalvo;
        } else {
          novaLista = [...lista, treinoSalvo];
        }

        return { ...prev, [activeTab]: novaLista };
      });

      setShowModalAdd(false);
      setTreinoEditando(null);
      setShowEditar(false);
      setTreinoSelecionado(null);
    } catch (err) {
      console.error("Erro ao salvar treino:", err);
      alert(err?.response?.data?.error || "Erro ao salvar treino");
    }
  };

  const handleDesatribuirTreino = async (idTreino) => {
    if (!window.confirm("Tem certeza que deseja desatribuir este treino?")) {
      return;
    }

    try {
      await treinosService.desatribuir(idTreino);
      await carregarTreinos(); // Recarrega a lista
      alert("Treino desatribuído com sucesso!");
    } catch (err) {
      console.error("Erro ao desatribuir treino:", err);
      alert(err?.response?.data?.error || "Erro ao desatribuir treino");
    }
  };

  const renderTreinoCard = (treino) => {
        const isAbaAtribuidos = activeTab === "Treinos Atribuídos";
        
        return (
            <div
                key={treino.idTreino}
                className="treino-card popopoptata"
                onClick={() => {
                    setTreinoSelecionado(treino);
                    setShowEditar(true);
                }}
            >
                <div className="card-actions">
                    {activeTab === "Meus Treinos" && (
                        <>
                            <button
                                className="edit-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setTreinoEditando(treino);
                                    setShowModalAdd(true);
                                }}
                            >
                                <FiEdit size={18} />
                            </button>
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTreino(treino.idTreino);
                                }}
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </>
                    )}
                    
                    {isAbaAtribuidos && (
                        <button
                            className="desatribuir-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDesatribuirTreino(treino.idTreino);
                            }}
                            title="Desatribuir treino"
                        >
                            <FiUser size={16} />
                            Desatribuir
                        </button>
                    )}
                </div>

                <h3>{treino.nome}</h3>
                <p>{treino.descricao}</p>
                
                {isAbaAtribuidos && treino.nomeAluno && (
                    <div className="aluno-info">
                        <small>
                            <FiUser size={12} /> Atribuído para: {treino.nomeAluno}
                        </small>
                        {treino.emailAluno && (
                            <small>Email: {treino.emailAluno}</small>
                        )}
                    </div>
                )}
                
                {treino.tipo_treino === 'adaptado' && (
                    <span className="badge-adaptado">Adaptado</span>
                )}
            </div>
        );
    };

  const handleDeleteTreino = async (idTreino) => {
    try {
      await treinosService.deletar(idTreino);
      setTreinos((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((t) => t.idTreino !== idTreino),
      }));
      if (treinoSelecionado?.idTreino === idTreino) {
        setShowEditar(false);
        setTreinoSelecionado(null);
      }
    } catch (err) {
      console.error("Erro ao deletar treino:", err);
      alert(err?.response?.data?.error || "Erro ao deletar treino");
    }
  };

  const handleTabClick = (tab) => {
    if (tab === activeTab) return;
    setFade(false);
    setTimeout(() => {
      setActiveTab(tab);
      setTreinoSelecionado(null);
      setShowEditar(false);
      setFade(true);
    }, 200);
  };

  return (
        <div className="treino treinos-container">
            <div className="PT1">
                <h2>{activeTab}</h2>
                <div className="navlinktn">
                    {abas.map((tab) => (
                        <a
                            key={tab}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleTabClick(tab);
                            }}
                            className={activeTab === tab ? "active" : ""}
                        >
                            {tab}
                        </a>
                    ))}
                </div>
                {activeTab === "Meus Treinos" && (
                    <div
                        className={`pflidc fufufa fade-container ${
                            fade ? "fade-in" : "fade-out"
                        }`}
                    >
                        <button
                            onClick={() => {
                                setTreinoEditando(null);
                                setShowModalAdd(true);
                            }}
                        >
                            Criar novo Treino
                        </button>
                    </div>
                )}
            </div>

            {/* SEÇÃO DE LISTAGEM DE TREINOS */}
            <div className={`PT2 fade-container ${fade ? "fade-in" : "fade-out"}`}>
                <div className="containertnvw">
                    {treinosDaAbaAtual.length === 0 ? (
                    <h1 className="ntnnnntast">
                        {activeTab === "Treinos Atribuídos" 
                        ? "Nenhum treino atribuído" 
                        : activeTab === "Meus Treinos"
                        ? "Nenhum treino criado"
                        : activeTab === "Personal"
                        ? "Nenhum treino atribuído pelo personal"
                        : "Nenhum treino disponível"}
                    </h1>
                    ) : (
                    treinosDaAbaAtual.map(renderTreinoCard)
                    )}
                </div>
            </div>

            {showModalAdd && activeTab === "Meus Treinos" && (
                <ModalAddTreino
                    onClose={() => {
                        setShowModalAdd(false);
                        setTreinoEditando(null);
                    }}
                    onSave={handleSaveTreino}
                    treino={treinoEditando}
                />
            )}

            {showEditar && treinoSelecionado && (
                <div
                    className="modal-overlay"
                    style={{
                        height: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        paddingTop: "120px",
                    }}
                >
                    <div className="editcontttttent">
                        <EditarTreino
                            treino={{
                                ...treinoSelecionado,
                                idTreino: treinoSelecionado.idTreino,
                            }}
                            abaAtiva={activeTab}
                            onVoltar={() => {
                                setShowEditar(false);
                                setTreinoSelecionado(null);
                            }}
                            onSave={handleSaveTreino}
                            onDelete={() =>
                                treinoSelecionado &&
                                handleDeleteTreino(treinoSelecionado.idTreino)
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Treinos;
