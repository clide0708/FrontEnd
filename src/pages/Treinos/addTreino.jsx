import { useState, useEffect } from "react";

export default function ModalAddTreino({ onClose, onSave, treino }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("Musculação");
  const [tipoTreino, setTipoTreino] = useState("normal"); // normal ou adaptado

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (treino) {
      setNome(treino.nome || "");
      setDescricao(treino.descricao || "");
      setTipo(treino.tipo || "Musculação");
      setTipoTreino(treino.tipo_treino || "normal");
    }
  }, [treino]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      tipo_treino: tipoTreino,
      descricao: descricao.trim() || null,
      criadoPor: usuario.email,
      idAluno: usuario.tipo === "aluno" ? usuario.id : null,
      idPersonal: usuario.tipo === "personal" ? usuario.id : null,
      exercicios: treino ? treino.exercicios : [],
    };

    await onSave(novoTreino);
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

          {usuario.tipo === 'personal' && (
            <label className="label-add-treino">
              Tipo de Treino:
              <select
                className="input-add-treino"
                value={tipoTreino}
                onChange={(e) => setTipoTreino(e.target.value)}
                required
              >
                <option value="normal">Normal</option>
                <option value="adaptado">Adaptado</option>
              </select>
              <small>
                {tipoTreino === 'adaptado' 
                  ? 'Treino para pessoas com necessidades especiais, mobilidade reduzida, etc.'
                  : 'Treino convencional'
                }
              </small>
            </label>
          )}

          <label className="label-add-treino" style={{ display: "none" }}>
            Modalidade:
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