import { useState, useEffect } from "react";
import "./style.css";
import EditarTreino from "./editTreino";
import ModalAddTreino from "./addTreino";
import treinosService from "../../services/Treinos/treinos.jsx";

function Treinos() {
  const [activeTab, setActiveTab] = useState("Meus Treinos");
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [treinoEditando, setTreinoEditando] = useState(null);
  const [treinos, setTreinos] = useState({
    "Meus Treinos": [],
    Personal: [],
    MarketPlace: [],
  });

  // carrega lista ao montar ou trocar de aba
  useEffect(() => {
    if (activeTab === "Meus Treinos") {
      treinosService.listarMeus().then((data) => {
        setTreinos((prev) => ({
          ...prev,
          "Meus Treinos": data,
        }));
      });
    }

    if (activeTab === "Personal") {
      treinosService.listarPersonal().then((data) => {
        setTreinos((prev) => ({
          ...prev,
          Personal: data,
        }));
      });
    }
  }, [activeTab]);

  const handleSaveTreino = async (novoTreino) => {
    let treinoSalvo;
    if (novoTreino.id) {
      treinoSalvo = await treinosService.editar(novoTreino);
    } else {
      treinoSalvo = await treinosService.criar(novoTreino);
    }

    setTreinos((prev) => {
      const lista = prev[activeTab];
      const index = lista.findIndex((t) => t.id === treinoSalvo.id);

      let novaLista;
      if (index >= 0) {
        novaLista = [...lista];
        novaLista[index] = treinoSalvo;
      } else {
        novaLista = [...lista, treinoSalvo];
      }

      return {
        ...prev,
        [activeTab]: novaLista,
      };
    });
  };

  const handleDeleteTreino = async (id) => {
    await treinosService.deletar(id);
    setTreinos((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((t) => t.id !== id),
    }));
  };

  return (
    <div className="treinos-container">
      {!selectedTreino ? (
        <>
          <div className="PT1">
            <h2>{activeTab}</h2>
            <div className="navlinktn">
              {["Meus Treinos", "Personal", "MarketPlace"].map((tab) => (
                <a
                  key={tab}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(tab);
                    setSelectedTreino(null);
                  }}
                  className={activeTab === tab ? "active" : ""}
                >
                  {tab}
                </a>
              ))}
            </div>
            <div className="ststn">
              {activeTab === "Meus Treinos" && !selectedTreino && (
                <div className="pflidc fufufa">
                  <button
                    onClick={() => {
                      setTreinoEditando(null);
                      setShowModal(true);
                    }}
                  >
                    Criar novo Treino
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="PT2">
            <div className="containertnvw">
              {treinos[activeTab].length === 0 ? (
                <h1 className="ntnnnntast">Sem treinos atribuidos</h1>
              ) : (
                treinos[activeTab].map((treino) => (
                  <div
                    key={treino.id}
                    className="treino-card popopoptata"
                    onClick={() => setSelectedTreino(treino)}
                  >
                    <div className="card-actions">
                      {activeTab === "Meus Treinos" && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTreinoEditando(treino);
                              setShowModal(true);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTreino(treino.id);
                            }}
                          >
                            🗑️
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
        </>
      ) : (
        <EditarTreino
          treino={selectedTreino}
          onVoltar={() => setSelectedTreino(null)}
        />
      )}

      {showModal && activeTab === "Meus Treinos" && (
        <ModalAddTreino
          onClose={() => setShowModal(false)}
          onSave={handleSaveTreino}
          treino={treinoEditando}
        />
      )}
    </div>
  );
}

export default Treinos;
