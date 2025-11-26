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
      const res = await api.post(`/notificacoes/${idNotificacao}/marcar-lida`);
      return res.data;
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
      return { success: false, error: err.message };
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
  }
};

export default notificacoesService;