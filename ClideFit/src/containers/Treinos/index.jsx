import { useState } from "react";
import "./style.css";

// JSON dos treinos com exercícios dentro
const treinosJSON = {
  "Meus Treinos": [
    {
      id: 1,
      nome: "Treino A",
      descricao: "Descrição do treino A",
      exercicios: [
        {
          id: 1,
          nome: "Supino Reto",
          series: 3,
          repeticoes: 12,
          peso: 20,
          descanso: 60,
          desc: "galilili",
        },
        {
          id: 2,
          nome: "Agachamento",
          series: 4,
          repeticoes: 10,
          peso: 40,
          descanso: 90,
          desc: "galilili",
        },
        {
          id: 3,
          nome: "Rosca Direta",
          series: 3,
          repeticoes: 15,
          peso: 15,
          descanso: 45,
          desc: "galilili",
        },
      ],
    },
    {
      id: 2,
      nome: "Treino B",
      descricao: "Descrição do treino B",
      exercicios: [
        {
          id: 1,
          nome: "Puxada Aberta",
          series: 4,
          repeticoes: 12,
          peso: 30,
          descanso: 60,
          desc: "galilili",
        },
        {
          id: 2,
          nome: "Levantamento Terra",
          series: 3,
          repeticoes: 8,
          peso: 50,
          descanso: 120,
          desc: "galilili",
        },
      ],
    },
    {
      id: 3,
      nome: "Treino C",
      descricao: "Descrição do treino C",
      exercicios: [],
    },
    {
      id: 4,
      nome: "Treino D",
      descricao: "Descrição do treino D",
      exercicios: [],
    },
  ],
  Personal: [
    {
      id: 1,
      nome: "Treino Personal X",
      descricao: "Descrição do treino X",
      exercicios: [
        {
          id: 1,
          nome: "Flexão de Braço",
          series: 3,
          repeticoes: 20,
          peso: 0,
          descanso: 30,
          desc: "galilili",
        },
        {
          id: 2,
          nome: "Burpee",
          series: 4,
          repeticoes: 15,
          peso: 0,
          descanso: 60,
          desc: "galilili",
        },
      ],
    },
  ],
  MarketPlace: [
    {
      id: 1,
      nome: "Treino Marketplace 1",
      descricao: "Descrição do treino 1",
      exercicios: [
        {
          id: 1,
          nome: "Corrida",
          series: 1,
          repeticoes: 20,
          peso: 0,
          descanso: 120,
          desc: "galilili",
        },
        {
          id: 2,
          nome: "Abdominal",
          series: 4,
          repeticoes: 25,
          peso: 0,
          descanso: 45,
          desc: "galilili",
        },
      ],
    },
  ],
};

function Treinos() {
  const [activeTab, setActiveTab] = useState("Meus Treinos");
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [selectedExercicio, setSelectedExercicio] = useState(null);

  const handleEditChange = (field, value) => {
    if (!selectedExercicio) return;
    const updated = { ...selectedExercicio, [field]: value };
    setSelectedExercicio(updated);

    // atualiza também dentro do treino
    setSelectedTreino((prev) => ({
      ...prev,
      exercicios: prev.exercicios.map((ex) =>
        ex.id === updated.id ? updated : ex
      ),
    }));
  };

  return (
    <div className="treinos-container">
      {/* coluna da esquerda */}
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
                setSelectedExercicio(null);
              }}
              className={activeTab === tab ? "active" : ""}
            >
              {tab}
            </a>
          ))}
        </div>
        <div className="ststn">
          {/* só mostra esse bloco se não tiver treino selecionado */}
          {!selectedTreino && (
            <div className="pflidc fufufa">
              <button>Criar novo Treino</button>
            </div>
          )}

          {/* botão iniciar treino quando tiver treino selecionado */}
          {selectedTreino && (
            <div className="iniciar-treino-container">
              <button>Começar</button>
            </div>
          )}
        </div>
      </div>

      {/* coluna da direita */}
      <div className="PT2">
        {/* se não clicou em treino → mostra cards */}
        {!selectedTreino ? (
          <>
            <div className="containertnvw">
              {treinosJSON[activeTab].map((treino) => (
                <div
                  key={treino.id}
                  className={`treino-card popopoptata${
                    selectedTreino?.id === treino.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTreino(treino)}
                >
                  <button className="delete-btn">🗑️</button>
                  <h3>{treino.nome}</h3>
                  <p>{treino.descricao}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* detalhes do treino */}
            <div className="treino-detalhes">
              <button onClick={() => setSelectedTreino(null)}>← Voltar</button>
              <h2>{selectedTreino.nome}</h2>
            </div>
            <div className="treino-content">
              {/* editor de exercício */}
              <div className="editor-exercicio">
                {selectedExercicio ? (
                  <>
                    <h3>{selectedExercicio.nome}</h3>
                    <label>
                      Séries:
                      <input
                        type="number"
                        value={selectedExercicio.series}
                        onChange={(e) =>
                          handleEditChange("series", parseInt(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      Repetições:
                      <input
                        type="number"
                        value={selectedExercicio.repeticoes}
                        onChange={(e) =>
                          handleEditChange(
                            "repeticoes",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </label>
                    <label>
                      Peso (kg):
                      <input
                        type="number"
                        value={selectedExercicio.peso}
                        onChange={(e) =>
                          handleEditChange("peso", parseFloat(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      Descanso (s):
                      <input
                        type="number"
                        value={selectedExercicio.descanso}
                        onChange={(e) =>
                          handleEditChange("descanso", parseInt(e.target.value))
                        }
                      />
                    </label>

                    <h4 className="desctrn">{selectedExercicio.desc}</h4>
                  </>
                ) : (
                  <p>Selecione um exercício</p>
                )}
              </div>
              {/* lista de exercícios */}
              <div className="lista-exercicios">
                <ul>
                  {selectedTreino.exercicios.length > 0 ? (
                    selectedTreino.exercicios.map((ex) => (
                      <li
                        key={ex.id}
                        onClick={() => setSelectedExercicio(ex)}
                        className={
                          selectedExercicio?.id === ex.id
                            ? "active-exercicio"
                            : ""
                        }
                      >
                        {ex.nome}
                        <a className="dltaex" href="">
                          X
                        </a>
                      </li>
                    ))
                  ) : (
                    <p>Nenhum exercício cadastrado.</p>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Treinos;
