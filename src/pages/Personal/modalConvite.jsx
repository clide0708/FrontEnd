import { useState } from "react";
import "./style.css";
// CORREÇÃO: Importar as funções específicas em vez do default
import { criarConvite } from "../../services/Notification/convites";

export default function InviteModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarConvite = async () => {
    if (!email) return alert("Digite um email válido!");

    setLoading(true);
    try {
      // CORREÇÃO: Passar o email como objeto
      await criarConvite({ email });
      alert("Convite enviado com sucesso!");
      setEmail("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar convite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Enviar convite</h2>
        <input
          type="email"
          placeholder="Digite o email do aluno"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose} className="btnCancelar">Cancelar</button>
          <button onClick={enviarConvite} className="btnEnviar" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}