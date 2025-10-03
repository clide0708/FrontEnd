import { useState, useEffect } from "react";
import exerciciosService from "../../services/Treinos/exercicios.jsx";
import "./style.css";

export default function AddExercicio({ onAdd, onClose }) {
  const [grupo, setGrupo] = useState("");
  const [exercicio, setExercicio] = useState(null);
  const [exerciciosDisponiveis, setExerciciosDisponiveis] = useState([]);
  const [todosExercicios, setTodosExercicios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [numSeries, setNumSeries] = useState(1);
  const [numRepeticoes, setNumRepeticoes] = useState(1);
  const [peso, setPeso] = useState("");
  const [descanso, setDescanso] = useState("");

  useEffect(() => {
    const fetchExercicios = async () => {
      const res = await exerciciosService.buscarTodosExercicios();
      setTodosExercicios(res || []);
      setLoading(false);
    };
    fetchExercicios();
  }, []);

  useEffect(() => {
    if (grupo) {
      const filtrados = todosExercicios.filter(
        (ex) => ex.grupoMuscular === grupo
      );
      setExerciciosDisponiveis(filtrados);
      setExercicio(null);
    } else {
      setExerciciosDisponiveis([]);
      setExercicio(null);
    }
  }, [grupo, todosExercicios]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exercicio) return;

    const novoExercicio = {
      ...exercicio,
      id: exercicio.idExercicio || exercicio.id,
      series: numSeries,
      repeticoes: numRepeticoes,
      peso: peso ? parseFloat(peso) : 0,
      descanso: descanso ? parseInt(descanso) : 0,
    };

    onAdd(novoExercicio);
    onClose();
  };

  if (loading) return <div className="modal-overlay">Carregando exercícios...</div>;

  const gruposUnicos = [...new Set(todosExercicios.map((ex) => ex.grupoMuscular).filter(Boolean))];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Adicionar Novo Exercício</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Músculo:</label>
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
              <option value="" disabled hidden>Selecione...</option>
              {gruposUnicos.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Exercício:</label>
            <select
              value={exercicio?.nome || ""}
              onChange={(e) =>
                setExercicio(
                  exerciciosDisponiveis.find((ex) => ex.nome === e.target.value) || null
                )
              }
              disabled={!grupo || exerciciosDisponiveis.length === 0}
            >
              <option value="" disabled hidden>
                {grupo
                  ? exerciciosDisponiveis.length > 0
                    ? "Selecione o exercício"
                    : "Nenhum exercício neste grupo"
                  : "Selecione um músculo primeiro"}
              </option>
              {exerciciosDisponiveis.map((ex) => (
                <option key={ex.idExercicio || ex.id} value={ex.nome}>{ex.nome}</option>
              ))}
            </select>
          </div>

          <div className="iptex">
            <label>Séries*</label>
            <input type="number" min="1" value={numSeries} onChange={(e) => setNumSeries(parseInt(e.target.value) || 1)} />
          </div>

          <div className="iptex">
            <label>Repetições*</label>
            <input type="number" min="1" value={numRepeticoes} onChange={(e) => setNumRepeticoes(parseInt(e.target.value) || 1)} />
          </div>

          <div className="iptex">
            <label>Peso (kg - opcional)</label>
            <input type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>

          <div className="iptex">
            <label>Descanso (s - opcional)</label>
            <input type="number" value={descanso} onChange={(e) => setDescanso(e.target.value)} />
          </div>

          <div className="btns-add-ex">
            <button type="button" className="clcbt" onClick={onClose}>Cancelar</button>
            <button type="submit" className="mdnbt">Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
