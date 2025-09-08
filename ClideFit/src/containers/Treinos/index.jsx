// src/components/Treinos.jsx
import { useState } from "react";
import "./style.css";
import EditarTreino from "./editTreino";
import ModalAddTreino from "./addTreino";

const treinosJSON = {
  "Meus Treinos": [
    {
      id: 1,
      nome: "Treino A",
      descricao: "Descrição do treino A",
      exercicios: [],
    },
  ],
  Personal: [],
  MarketPlace: [],
};

function Treinos() {
  const [activeTab, setActiveTab] = useState("Meus Treinos");
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [treinoEditando, setTreinoEditando] = useState(null);
  const [treinos, setTreinos] = useState(treinosJSON);

  const handleSaveTreino = (novoTreino) => {
    setTreinos((prev) => {
      const lista = prev[activeTab];
      const index = lista.findIndex((t) => t.id === novoTreino.id);

      let novaLista;
      if (index >= 0) {
        // edição
        novaLista = [...lista];
        novaLista[index] = novoTreino;
      } else {
        // criação
        novaLista = [...lista, novoTreino];
      }

      return {
        ...prev,
        [activeTab]: novaLista,
      };
    });
  };

  return (
    <div className="treinos-container">
      {!selectedTreino ? (
        <>
          {/* Coluna esquerda */}
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
              {!selectedTreino && (
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

          {/* Coluna direita */}
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
                          setTreinos((prev) => ({
                            ...prev,
                            [activeTab]: prev[activeTab].filter(
                              (t) => t.id !== treino.id
                            ),
                          }));
                        }}
                      >
                        🗑️
                      </button>
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

      {showModal && (
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
