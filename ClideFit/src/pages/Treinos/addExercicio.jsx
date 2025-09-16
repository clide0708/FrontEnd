import { useState, useEffect } from "react";
import "./style.css";

// exemplo do JSON que tu tem
import exerciciosJSON from "./exercicios.json";

export default function AddExercicio({ onAdd, onClose }) {
  const [grupo, setGrupo] = useState("");
  const [exercicio, setExercicio] = useState(null);
  const [exerciciosDisponiveis, setExerciciosDisponiveis] = useState([]);
  const [numSeries, setNumSeries] = useState(1);
  const [numRepeticoes, setNumRepeticoes] = useState(1);
  const [peso, setPeso] = useState("");
  const [descanso, setDescanso] = useState("");

  useEffect(() => {
    if (grupo) {
      const filtrados = exerciciosJSON.filter((ex) => ex.grupo === grupo);
      setExerciciosDisponiveis(filtrados);
      setExercicio(null);
    } else {
      setExerciciosDisponiveis([]);
      setExercicio(null);
    }
  }, [grupo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exercicio) return;

    const novoExercicio = {
      ...exercicio,
      id: Date.now(),
      series: numSeries,
      repeticoes: numRepeticoes,
      peso: peso ? parseFloat(peso) : 0,
      descanso: descanso ? parseInt(descanso) : 0,
    };

    onAdd(novoExercicio);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <h2>Adicionar Novo Exercício</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Músculo:</label>
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
              <option value="" disabled hidden>
                Selecione...
              </option>
              {[...new Set(exerciciosJSON.map((ex) => ex.grupo))].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Exercício:</label>
            <select
              value={exercicio?.nome || ""}
              onChange={(e) =>
                setExercicio(
                  exerciciosDisponiveis.find((ex) => ex.nome === e.target.value)
                )
              }
              disabled={!grupo}
            >
              <option value="" disabled hidden>
                {grupo
                  ? "Selecione o exercício"
                  : "Selecione um músculo primeiro"}
              </option>
              {exerciciosDisponiveis.map((ex) => (
                <option key={ex.nome} value={ex.nome}>
                  {ex.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="iptex">
            <label>Séries*</label>
            <input
              type="number"
              min="1"
              value={numSeries}
              onChange={(e) => setNumSeries(parseInt(e.target.value))}
            />
          </div>

          <div className="iptex">
            <label>Repetições*</label>
            <input
              type="number"
              min="1"
              value={numRepeticoes}
              onChange={(e) => setNumRepeticoes(parseInt(e.target.value))}
            />
          </div>

          <div className="iptex">
            <label>Peso (kg - opcional)</label>
            <input
              type="number"
              step="0.01"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </div>

          <div className="iptex">
            <label>Descanso (s - opcional)</label>
            <input
              type="number"
              value={descanso}
              onChange={(e) => setDescanso(e.target.value)}
            />
          </div>

          <div className="btns-add-ex">
            <button type="button" className="clcbt" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="mdnbt">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
