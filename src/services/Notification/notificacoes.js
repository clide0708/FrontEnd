import api from "../api";

const notificacoesService = {
  // Buscar notificações do usuário
  getNotificacoes: async () => {
    try {
      const res = await api.get('/notificacoes');
      return res.data.success ? res.data.data : [];
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      return [];
    }
  },

  // Marcar notificação como lida
  marcarComoLida: async (idNotificacao) => {
    try {
        const res = await api.put(`/notificacoes/${idNotificacao}/lida`);
        return res.data;
    } catch (err) {
        console.error("Erro ao marcar notificação como lida:", err);
        
        // Tentar método alternativo (POST)
        try {
        const res = await api.post(`/notificacoes/${idNotificacao}/lida`);
        return res.data;
        } catch (postErr) {
        console.error("Erro no método POST também:", postErr);
        return { success: false, error: 'Não foi possível marcar como lida' };
        }
    }
 },

  // Marcar todas as notificações como lidas
  marcarTodasComoLidas: async () => {
    try {
      const res = await api.post('/notificacoes/marcar-todas-lidas');
      return res.data;
    } catch (err) {
      console.error("Erro ao marcar todas as notificações como lidas:", err);
      return { success: false, error: err.message };
    }
  },

  // Buscar contador de notificações não lidas
  getContadorNotificacoes: async () => {
    try {
      const res = await api.get('/notificacoes/contador');
      return res.data.success ? res.data.total : 0;
    } catch (err) {
      console.error("Erro ao buscar contador de notificações:", err);
      return 0;
    }
  },

  aceitarConvite: async (idConvite) => {
    try {
      const res = await api.post(`/convites/${idConvite}/aceitar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
      return { success: false, error: err.message };
    }
  },

  recusarConvite: async (idConvite) => {
    try {
      const res = await api.post(`/convites/${idConvite}/recusar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao recusar convite:", err);
      return { success: false, error: err.message };
    }
  }
  
};

export default notificacoesService;