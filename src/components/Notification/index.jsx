import { useState, useEffect } from "react";
import notificacoesService from "../../services/Notification/notificacoes";
import { Bell, Check, X, CheckCircle, XCircle } from "lucide-react";
import "./style.css";

export default function NotificacoesModal({ isOpen, onClose }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarNotificacoes = async () => {
    setLoading(true);
    try {
      const data = await notificacoesService.getNotificacoes();
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarNotificacoes();
    }
  }, [isOpen]);

  const handleMarcarComoLida = async (idNotificacao) => {
    try {
      await notificacoesService.marcarComoLida(idNotificacao);
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.idNotificacao === idNotificacao 
            ? { ...notif, lida: 1 } 
            : notif
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    try {
      await notificacoesService.marcarTodasComoLidas();
      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, lida: 1 }))
      );
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const getIconePorTipo = (tipo) => {
    switch (tipo) {
      case 'convite_aceito':
        return <CheckCircle size={16} className="text-success" />;
      case 'convite_recusado':
        return <XCircle size={16} className="text-error" />;
      default:
        return <Bell size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Notificações</h3>
          <div className="notification-actions">
            <button 
              onClick={handleMarcarTodasComoLidas}
              className="btn-marcar-todas"
              disabled={notificacoes.every(n => n.lida)}
            >
              Marcar todas como lidas
            </button>
            <button className="btn-fechar" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="loading-notificacoes">Carregando notificações...</div>
          ) : notificacoes.length === 0 ? (
            <div className="empty-notificacoes">
              <Bell size={48} />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <div 
                key={notificacao.idNotificacao} 
                className={`notification-item ${notificacao.lida ? 'lida' : 'nao-lida'}`}
              >
                <div className="notification-icon">
                  {getIconePorTipo(notificacao.tipo)}
                </div>
                <div className="notification-content">
                  <h4>{notificacao.titulo}</h4>
                  <p>{notificacao.mensagem}</p>
                  <span className="notification-time">
                    {new Date(notificacao.data_criacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notificacao.lida && (
                    <button 
                      onClick={() => handleMarcarComoLida(notificacao.idNotificacao)}
                      className="btn-marcar-lida"
                      title="Marcar como lida"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para o ícone de notificações na navbar
export function NotificationBell({ onClick, contador }) {
  return (
    <div className="notification-bell-container" onClick={onClick}>
      <Bell size={20} />
      {contador > 0 && (
        <span className="notification-badge">{contador > 99 ? '99+' : contador}</span>
      )}
    </div>
  );
}