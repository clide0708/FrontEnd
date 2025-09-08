import { useState } from "react";
import AddExercicio from "./addExercicio";
import Treino from "./treinando";
import "./style.css";

export default function EditarTreino({ treino, onVoltar }) {
  const [currentTreino, setCurrentTreino] = useState(treino);
  const [selectedExercicio, setSelectedExercicio] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [iniciou, setIniciou] = useState(false); // controla tela de treino

  const handleEditChange = (field, value) => {
    if (!selectedExercicio) return;
    const updated = { ...selectedExercicio, [field]: value };
    setSelectedExercicio(updated);

    setCurrentTreino((prev) => ({
      ...prev,
      exercicios: prev.exercicios.map((ex) =>
        ex.id === updated.id ? updated : ex
      ),
    }));
  };

  const handleRemoveExercicio = (id) => {
    setCurrentTreino((prev) => ({
      ...prev,
      exercicios: prev.exercicios.filter((ex) => ex.id !== id),
    }));
    if (selectedExercicio?.id === id) setSelectedExercicio(null);
  };

  const handleAddExercicio = (novoEx) => {
    setCurrentTreino((prev) => ({
      ...prev,
      exercicios: [...prev.exercicios, novoEx],
    }));
  };

  // se iniciou treino, renderiza a tela Treino
  if (iniciou) {
    return <Treino treino={currentTreino} />;
  }

  return (
    <div className="editar-treino-container">
      <div className="btnhd">
        <button onClick={onVoltar}>← Voltar</button>
        <h2>{currentTreino.nome}</h2>
      </div>

      <div className="headertrn">
        <h3>
          {selectedExercicio
            ? selectedExercicio.nome
            : "Selecione um exercício"}
        </h3>
        <h2>Exercícios</h2>
      </div>

      <div className="treino-content">
        <div className="editor-exercicio">
          {selectedExercicio ? (
            <>
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
                    handleEditChange("repeticoes", parseInt(e.target.value))
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
              {selectedExercicio.informacoes && (
                <p>{selectedExercicio.informacoes}</p>
              )}
              {selectedExercicio.url && (
                <a
                  href={selectedExercicio.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Vídeo
                </a>
              )}
            </>
          ) : (
            <h1>Selecione um exercício para editar</h1>
          )}
        </div>

        <div className="lista-exercicios">
          <ul>
            {currentTreino.exercicios.length > 0 ? (
              currentTreino.exercicios.map((ex) => (
                <li
                  key={ex.id}
                  className={
                    selectedExercicio?.id === ex.id ? "active-exercicio" : ""
                  }
                  onClick={() => setSelectedExercicio(ex)}
                >
                  {ex.nome}
                  <a
                    className="dltaex"
                    onClick={() => handleRemoveExercicio(ex.id)}
                  >
                    X
                  </a>
                </li>
              ))
            ) : (
              <p>Nenhum exercício ainda.</p>
            )}
          </ul>

          <div className="ftltex">
            <button className="addexbtn" onClick={() => setShowAdd(true)}>
              Adicionar exercício +
            </button>
            <div className="bttcmc">
              <button onClick={() => setIniciou(true)}>Iniciar</button>
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddExercicio
          onAdd={handleAddExercicio}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
