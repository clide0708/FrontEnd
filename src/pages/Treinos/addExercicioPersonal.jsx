import { useState } from "react";
import exerciciosPersonalService from "../../services/Treinos/exerciciosPersonal";
import "./style.css";

export default function AddExercicioPersonal({ onAdd, onClose, tipoTreino }) {
  const [formData, setFormData] = useState({
    nome: "",
    grupoMuscular: "",
    descricao: "",
    tipo_exercicio: tipoTreino, // Usar o tipo do treino diretamente
    video_url: ""
  });
  const [loading, setLoading] = useState(false);

  const gruposMusculares = [
    "Peito", "Costas", "Ombros", "Bíceps", "Tríceps", 
    "Antebraço", "Abdomen", "Quadríceps", "Posterior de Coxa",
    "Glúteos", "Panturrilha", "Adutores", "Abductores", "Lombar"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Cadastrando exercício:", formData);
      
      const resultado = await exerciciosPersonalService.cadastrarExercicio(formData);
      
      if (resultado.success) {
        console.log("Exercício cadastrado com ID:", resultado.idExercicio);
        
        // Buscar o exercício recém-criado
        let novoExercicio;
        if (tipoTreino === 'normal') {
          const exercicios = await exerciciosPersonalService.buscarMeusExercicios();
          novoExercicio = exercicios.find(ex => ex.idExercicio === resultado.idExercicio);
        } else {
          const exercicios = await exerciciosPersonalService.buscarMeusExerciciosAdaptados();
          novoExercicio = exercicios.find(ex => ex.idExercicio === resultado.idExercicio);
        }
        
        if (novoExercicio) {
          onAdd(novoExercicio);
        } else {
          console.warn("Exercício cadastrado mas não encontrado na busca");
          // Criar objeto básico se não encontrado
          const exercicioBasico = {
            id: resultado.idExercicio,
            idExercicio: resultado.idExercicio,
            nome: formData.nome,
            grupoMuscular: formData.grupoMuscular,
            descricao: formData.descricao,
            tipo_exercicio: tipoTreino,
            visibilidade: 'personal',
            video_url: formData.video_url
          };
          onAdd(exercicioBasico);
        }
        
        onClose();
      } else {
        alert(resultado.error || 'Erro ao cadastrar exercício');
      }
    } catch (error) {
      console.error('Erro ao cadastrar exercício:', error);
      alert(error.response?.data?.error || 'Erro ao cadastrar exercício');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Cadastrar Novo Exercício {tipoTreino === 'adaptado' ? 'Adaptado' : 'Normal'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome do Exercício*</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder={tipoTreino === 'adaptado' 
                ? "Ex: Flexão Adaptada de Joelhos" 
                : "Ex: Supino Inclinado com Halteres"
              }
            />
          </div>

          <div className="form-group">
            <label>Grupo Muscular*</label>
            <select
              name="grupoMuscular"
              value={formData.grupoMuscular}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {gruposMusculares.map(grupo => (
                <option key={grupo} value={grupo}>{grupo}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição*</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder={tipoTreino === 'adaptado' 
                ? "Descreva a execução adaptada, modificações, cuidados especiais, etc." 
                : "Descreva a execução do exercício, músculos trabalhados, etc."
              }
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>URL do Vídeo (Opcional)</label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="btns-add-ex">
            <button type="button" className="clcbt" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="mdnbt" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Exercício"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}