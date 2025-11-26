import { useState, useEffect } from "react";
import notificacoesService from "../../services/Notification/notificacoes";
import { Bell, Check, X, CheckCircle, XCircle, User } from "lucide-react";
import "./style.css";
import ImageUrlHelper from "../../utils/imageUrls";

export default function NotificacoesModal({ isOpen, onClose }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processando, setProcessando] = useState(null); // Para controlar qual convite está sendo processado

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

  const getFotoUrl = (fotoUrl) => {
    if (!fotoUrl || fotoUrl === 'null' || fotoUrl === 'undefined' || fotoUrl === '') {
      return ImageUrlHelper.getDefaultProfileImage();
    }
    return ImageUrlHelper.buildImageUrl(fotoUrl);
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
      case 'novo_convite':
        return <User size={16} className="text-primary" />;
      default:
        return <Bell size={16} />;
    }
  };

  const handleAceitarConvite = async (notificacao) => {
    setProcessando(notificacao.idConvite);
    try {
      const resultado = await notificacoesService.aceitarConvite(notificacao.idConvite);
      
      if (resultado.success) {
        // Remover a notificação de convite da lista
        setNotificacoes(prev => 
          prev.filter(notif => notif.idConvite !== notificacao.idConvite)
        );
        
        // Adicionar uma notificação de sucesso
        setNotificacoes(prev => [
          {
            idNotificacao: Date.now(), // ID temporário
            titulo: 'Convite Aceito',
            mensagem: `Você aceitou o convite de ${notificacao.nome_remetente}`,
            tipo: 'convite_aceito',
            lida: 0,
            data_criacao: new Date().toISOString(),
            origem: 'notificacao'
          },
          ...prev
        ]);
        
        alert('Convite aceito com sucesso!');
      } else {
        alert('Erro ao aceitar convite: ' + resultado.error);
      }
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      alert('Erro ao aceitar convite. Tente novamente.');
    } finally {
      setProcessando(null);
    }
  };

  const handleRecusarConvite = async (notificacao) => {
    setProcessando(notificacao.idConvite);
    try {
      const resultado = await notificacoesService.recusarConvite(notificacao.idConvite);
      
      if (resultado.success) {
        // Remover a notificação de convite da lista
        setNotificacoes(prev => 
          prev.filter(notif => notif.idConvite !== notificacao.idConvite)
        );
        
        // Adicionar uma notificação de confirmação
        setNotificacoes(prev => [
          {
            idNotificacao: Date.now(), // ID temporário
            titulo: 'Convite Recusado',
            mensagem: `Você recusou o convite de ${notificacao.nome_remetente}`,
            tipo: 'convite_recusado',
            lida: 0,
            data_criacao: new Date().toISOString(),
            origem: 'notificacao'
          },
          ...prev
        ]);
        
        alert('Convite recusado.');
      } else {
        alert('Erro ao recusar convite: ' + resultado.error);
      }
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
      alert('Erro ao recusar convite. Tente novamente.');
    } finally {
      setProcessando(null);
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
              disabled={notificacoes.every(n => n.lida) || notificacoes.length === 0}
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
                className={`notification-item ${notificacao.lida ? 'lida' : 'nao-lida'} ${
                  notificacao.origem === 'convite' ? 'convite-item' : ''
                }`}
              >
                <div className="notification-icon">
                  {getIconePorTipo(notificacao.tipo)}
                </div>
                <div className="notification-content">
                  <h4>{notificacao.titulo}</h4>
                  <p>{notificacao.mensagem}</p>
                  
                  {/* 🔥 NOVO: Foto do remetente para convites */}
                  {notificacao.origem === 'convite' && notificacao.foto_remetente && (
                    <div className="remetente-info">
                      <img 
                        src={getFotoUrl(notificacao.foto_remetente)}
                        alt={notificacao.nome_remetente}
                        className="foto-remetente"
                        onError={(e) => {
                          e.target.src = ImageUrlHelper.getDefaultProfileImage();
                        }}
                      />
                      <span className="nome-remetente">{notificacao.nome_remetente}</span>
                    </div>
                  )}
                  
                  <span className="notification-time">
                    {new Date(notificacao.data_criacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="notification-actions">
                  {/* 🔥 NOVO: Botões para convites */}
                  {notificacao.origem === 'convite' && !notificacao.lida && (
                    <div className="convite-actions">
                      <button 
                        onClick={() => handleAceitarConvite(notificacao)}
                        className="btn-aceitar"
                        disabled={processando === notificacao.idConvite}
                      >
                        {processando === notificacao.idConvite ? '...' : 'Aceitar'}
                      </button>
                      <button 
                        onClick={() => handleRecusarConvite(notificacao)}
                        className="btn-recusar"
                        disabled={processando === notificacao.idConvite}
                      >
                        {processando === notificacao.idConvite ? '...' : 'Recusar'}
                      </button>
                    </div>
                  )}
                  
                  {/* Botão de marcar como lida para notificações normais */}
                  {!notificacao.lida && notificacao.origem !== 'convite' && (
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