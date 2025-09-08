import { useState, useEffect } from "react";

export default function ModalAddTreino({ onClose, onSave, treino }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (treino) {
      setNome(treino.nome);
      setDescricao(treino.descricao);
    }
  }, [treino]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim() || !descricao.trim()) return;

    const novoTreino = {
      id: treino ? treino.id : Date.now(),
      nome,
      descricao,
      exercicios: treino ? treino.exercicios : [],
    };

    onSave(novoTreino);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contentadtn">
        <h2 className="modal-title">{treino ? "Editar Treino" : "Novo Treino"}</h2>
        <form className="form-add-treino" onSubmit={handleSubmit}>
          <label className="label-add-treino">
            Nome:
            <input
              type="text"
              className="input-add-treino"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </label>
          <label className="label-add-treino">
            Descrição:
            <textarea
              className="textarea-add-treino"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="b1" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="b2">
              {treino ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
