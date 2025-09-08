import { useState } from "react";
import "./style.css";
import EditarTreino from "./editTreino";

const treinosJSON = { "Meus Treinos": [{ id: 1, nome: "Treino A", descricao: "Descrição do treino A", exercicios: [{ id: 1, nome: "Supino Reto", series: 3, repeticoes: 12, peso: 20, descanso: 60, desc: "galilili", }, { id: 2, nome: "Agachamento", series: 4, repeticoes: 10, peso: 40, descanso: 90, desc: "galilili", }, { id: 3, nome: "Rosca Direta", series: 3, repeticoes: 15, peso: 15, descanso: 45, desc: "galilili", },], }, { id: 2, nome: "Treino B", descricao: "Descrição do treino B", exercicios: [{ id: 1, nome: "Puxada Aberta", series: 4, repeticoes: 12, peso: 30, descanso: 60, desc: "galilili", }, { id: 2, nome: "Levantamento Terra", series: 3, repeticoes: 8, peso: 50, descanso: 120, desc: "galilili", },], }, { id: 3, nome: "Treino C", descricao: "Descrição do treino C", exercicios: [], }, { id: 4, nome: "Treino D", descricao: "Descrição do treino D", exercicios: [], },], Personal: [{ id: 1, nome: "Treino Personal X", descricao: "Descrição do treino X", exercicios: [{ id: 1, nome: "Flexão de Braço", series: 3, repeticoes: 20, peso: 0, descanso: 30, desc: "galilili", }, { id: 2, nome: "Burpee", series: 4, repeticoes: 15, peso: 0, descanso: 60, desc: "galilili", },], },], MarketPlace: [{ id: 1, nome: "Treino Marketplace 1", descricao: "Descrição do treino 1", exercicios: [{ id: 1, nome: "Corrida", series: 1, repeticoes: 20, peso: 0, descanso: 120, desc: "galilili", }, { id: 2, nome: "Abdominal", series: 4, repeticoes: 25, peso: 0, descanso: 45, desc: "galilili", },], },], };

function Treinos() {
  const [activeTab, setActiveTab] = useState("Meus Treinos");
  const [selectedTreino, setSelectedTreino] = useState(null);

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
                  <button>Criar novo Treino</button>
                </div>
              )}
              {selectedTreino && (
                <div className="iniciar-treino-container">
                  <button>Começar</button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita */}
          <div className="PT2">
            <div className="containertnvw">
              {treinosJSON[activeTab].map((treino) => (
                <div
                  key={treino.id}
                  className={`treino-card popopoptata`}
                  onClick={() => setSelectedTreino(treino)}
                >
                  <button className="delete-btn">🗑️</button>
                  <h3>{treino.nome}</h3>
                  <p>{treino.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EditarTreino treino={selectedTreino} onVoltar={() => setSelectedTreino(null)} />
      )}
    </div>
  );
}

export default Treinos;
