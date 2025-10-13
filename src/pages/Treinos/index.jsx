import { useState, useEffect } from "react";
import "./style.css";
import EditarTreino from "./editTreino";
import ModalAddTreino from "./addTreino";
import treinosService from "../../services/Treinos/treinos.jsx";
import { FiEdit, FiTrash2 } from "react-icons/fi";

function Treinos() {
  const [activeTab, setActiveTab] = useState("Meus Treinos");
  const [fade, setFade] = useState(true);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [treinoEditando, setTreinoEditando] = useState(null);
  const [treinos, setTreinos] = useState({
    "Meus Treinos": [],
    Personal: [],
    MarketPlace: [],
  });

  const [showEditar, setShowEditar] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const abas = ["Meus Treinos", "MarketPlace"];
  if (usuario.tipo === "aluno") {
    abas.splice(1, 0, "Personal");
  }

  const carregarTreinos = async () => {
    try {
      if (activeTab === "Meus Treinos") {
        const data = await treinosService.listarMeus();
        setTreinos((prev) => ({ ...prev, "Meus Treinos": data }));
      } else if (activeTab === "Personal" && usuario.tipo === "aluno") {
        const data = await treinosService.listarTreinosPersonalDoAluno();
        setTreinos((prev) => ({ ...prev, Personal: data || [] }));
      } else if (activeTab === "MarketPlace") {
        setTreinos((prev) => ({ ...prev, MarketPlace: [] }));
      }
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
      alert("Erro ao carregar treinos");
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

      <div className={`PT2 fade-container ${fade ? "fade-in" : "fade-out"}`}>
        <div className="containertnvw">
          {treinos[activeTab].length === 0 ? (
            <h1 className="ntnnnntast">Sem treinos atribuídos</h1>
          ) : (
            treinos[activeTab].map((treino) => (
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
                </div>

                <h3>{treino.nome}</h3>
                <p>{treino.descricao}</p>
              </div>
            ))
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
