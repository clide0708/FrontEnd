import './style.css';
import { useState } from "react";
import convitesService from "../../services/Notification/convites";
import { FaTimes, FaCheck } from "react-icons/fa";

export default function NotificacoesModal({ isOpen, onClose, notificacoes, refresh }) {
  const [loadingIds, setLoadingIds] = useState([]);

  if (!isOpen) return null;

  const handleAceitar = async (idConvite) => {
    if (!window.confirm("Tem certeza que quer aceitar este convite?")) return;
    setLoadingIds((prev) => [...prev, idConvite]);
    const res = await convitesService.aceitarConvite(idConvite);
    setLoadingIds((prev) => prev.filter((id) => id !== idConvite));

    if (res.success) {
      alert(res.message);
      refresh(); // atualiza lista
    } else {
      alert("Erro: " + res.error);
    }
  };

  const handleNegar = async (idConvite) => {
    if (!window.confirm("Tem certeza que quer recusar este convite?")) return;
    setLoadingIds((prev) => [...prev, idConvite]);
    const res = await convitesService.negarConvite(idConvite);
    setLoadingIds((prev) => prev.filter((id) => id !== idConvite));

    if (res.success) {
      alert(res.message);
      refresh(); // atualiza lista
    } else {
      alert("Erro: " + res.error);
    }
  };

  return (
    <div className="notification">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Notificações</h2>
          <button className="close-btn" onClick={onClose}>
            X
          </button>

          <ul>
            {notificacoes && notificacoes.length > 0 ? (
              notificacoes.map((n) => (
                <li key={n.idConvite} className="notificacao-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
                  <div>
                    <p>
                      <strong>{n.nomePersonal}</strong> te enviou um convite 
                    </p>
                    <p>Status: <span className={`status ${n.status}`}>{n.status}</span></p>
                    <p className="data">{new Date(n.data_criacao).toLocaleDateString()}</p>
                  </div>

                  {n.status === "pendente" && (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => handleAceitar(n.idConvite)}
                        disabled={loadingIds.includes(n.idConvite)}
                        style={{ background: "green", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleNegar(n.idConvite)}
                        disabled={loadingIds.includes(n.idConvite)}
                        style={{ background: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li>Nenhuma notificação</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}