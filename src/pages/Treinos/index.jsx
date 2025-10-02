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

  // carregar treinos
  const carregarTreinos = async () => {
    if (activeTab === "Meus Treinos") {
      const data = await treinosService.listarMeus();
      setTreinos((prev) => ({ ...prev, "Meus Treinos": data }));
    } else if (activeTab === "Personal") {
      const data = await treinosService.listarPersonal();
      setTreinos((prev) => ({ ...prev, Personal: data }));
    }
  };

  useEffect(() => {
    carregarTreinos();
  }, [activeTab]);

  // salvar treino (novo ou edição)
  const handleSaveTreino = async (novoTreino) => {
    try {
      let treinoSalvo;
      if (novoTreino.idTreino) {
        treinoSalvo = await treinosService.editar(novoTreino);
      } else {
        treinoSalvo = await treinosService.criar(novoTreino);
      }

      // atualiza lista de treinos no state
      setTreinos((prev) => {
        const lista = prev[activeTab];
        const index = lista.findIndex((t) => t.idTreino === treinoSalvo.idTreino);

        let novaLista;
        if (index >= 0) {
          novaLista = [...lista];
          novaLista[index] = treinoSalvo;
        } else {
          novaLista = [...lista, treinoSalvo];
        }

        return { ...prev, [activeTab]: novaLista };
      });

      setShowModal(false);
      setTreinoEditando(null);
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
    } catch (err) {
      console.error("Erro ao deletar treino:", err);
      alert(err?.response?.data?.error || "Erro ao deletar treino");
    }
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
              {activeTab === "Meus Treinos" && (
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
                  <div key={treino.idTreino} className="treino-card popopoptata">
                    <div className="card-actions">
                      {activeTab === "Meus Treinos" && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setTreinoEditando(treino);
                              setShowModal(true);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteTreino(treino.idTreino)}
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
          onSave={handleSaveTreino} // passa handleSaveTreino pro EditarTreino
        />
      )}

      {showModal && activeTab === "Meus Treinos" && (
        <ModalAddTreino
          onClose={() => {
            setShowModal(false);
            setTreinoEditando(null);
          }}
          onSave={handleSaveTreino}
          treino={treinoEditando}
        />
      )}
    </div>
  );
}

export default Treinos;
