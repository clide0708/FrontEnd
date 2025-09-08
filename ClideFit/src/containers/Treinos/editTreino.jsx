import { useState } from "react";
import "./style.css"

function EditarTreino({ treino, onVoltar }) {
  const [selectedExercicio, setSelectedExercicio] = useState(null);
  const [currentTreino, setCurrentTreino] = useState(treino);

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

  return (
    <div className="editar-treino-container">
      <button onClick={onVoltar}>← Voltar</button>
      <h2>{currentTreino.nome}</h2>

      <div className="headertrn">
        {selectedExercicio ? (
          <>
            <h3>{selectedExercicio.nome}</h3>

          </>
        ) : null}
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

              <h4 className="desctrn">{selectedExercicio.desc}</h4>
            </>
          ) : (
            <p>Selecione um exercício</p>
          )}
        </div>
        <div className="lista-exercicios">
          <ul>
            {currentTreino.exercicios.length > 0 ? (
              currentTreino.exercicios.map((ex) => (
                <li
                  key={ex.id}
                  onClick={() => setSelectedExercicio(ex)}
                  className={selectedExercicio?.id === ex.id ? "active-exercicio" : ""}
                >
                  {ex.nome}
                  {selectedExercicio?.id === ex.id && (
                    <a className="dltaex" href="#">
                      X
                    </a>
                  )}
                </li>
              ))
            ) : (
              <p>Nenhum exercício cadastrado.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EditarTreino;
