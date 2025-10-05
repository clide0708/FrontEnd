import { useState, useEffect } from "react";

export default function ModalAddTreino({ onClose, onSave, treino }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("Musculação"); // valor padrão

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (treino) {
      setNome(treino.nome || "");
      setDescricao(treino.descricao || "");
      setTipo(treino.tipo || "Musculação");
    }
  }, [treino]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // valida campos obrigatórios
    if (!nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }
    if (!tipo.trim()) {
      alert("Tipo é obrigatório");
      return;
    }

    const novoTreino = {
      idTreino: treino ? treino.idTreino : undefined,
      nome: nome.trim(),
      tipo,
      descricao: descricao.trim() || null,
      criadoPor: usuario.email,
      idAluno: usuario.tipo === "aluno" ? usuario.id : null,
      idPersonal: usuario.tipo === "personal" ? usuario.id : null,
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
            Tipo:
            <select
              className="input-add-treino"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="Musculação">Musculação</option>
              <option value="CrossFit">CrossFit</option>
              <option value="Calistenia">Calistenia</option>
              <option value="Pilates">Pilates</option>
              <option value="Aquecimento">Aquecimento</option>
              <option value="Treino Específico">Treino Específico</option>
              <option value="Outros">Outros</option>
            </select>
          </label>

          <label className="label-add-treino">
            Descrição:
            <textarea
              className="textarea-add-treino"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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
