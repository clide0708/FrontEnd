import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddExercicio from "./addExercicio";
import "./style.css";

export default function EditarTreino({ treino, onVoltar }) {
  const [currentTreino, setCurrentTreino] = useState(treino);
  const [selectedExercicio, setSelectedExercicio] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const navigate = useNavigate();

  // auto seleciona o primeiro exercício
  useEffect(() => {
    if (currentTreino.exercicios.length > 0 && !selectedExercicio) {
      setSelectedExercicio(currentTreino.exercicios[0]);
    } else if (currentTreino.exercicios.length === 0) {
      setSelectedExercicio(null);
    }
  }, [currentTreino.exercicios, selectedExercicio]);

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

  return (
    <div className="editar-treino-container">
      <div className="btnhd">
        <button onClick={onVoltar}>← Voltar</button>
        <h2>{currentTreino.nome}</h2>
      </div>

      <div className="headertrn">
        <h3
          className={
            currentTreino.exercicios.length === 0 ? "empty-exercicio" : ""
          }
        >
          {selectedExercicio
            ? selectedExercicio.nome
            : currentTreino.exercicios.length === 0
            ? ""
            : "Selecione um exercício"}
        </h3>
        <h2>Exercícios</h2>
      </div>

      <div className="treino-content">
        <div className="editor-exercicio">
          {currentTreino.exercicios.length === 0 ? (
            <h1 className="asdoasd">Adicione um exercício</h1>
          ) : selectedExercicio ? (
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
          ) : null}
        </div>

        <div className="lista-exercicios">
          <ul>
            {currentTreino.exercicios.map((ex) => (
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
            ))}
          </ul>

          <div className="ftltex">
            <button className="addexbtn" onClick={() => setShowAdd(true)}>
              Adicionar exercício +
            </button>
            <div className="bttcmc">
              <button
                onClick={() =>
                  navigate("/Treinos/treinando", {
                    state: { treino: currentTreino },
                  })
                }
                disabled={currentTreino.exercicios.length === 0}
                style={{
                  opacity: currentTreino.exercicios.length === 0 ? 0.5 : 1,
                  cursor:
                    currentTreino.exercicios.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Iniciar
              </button>
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
