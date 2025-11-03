import api from "../api";

const convitesService = {
  // Buscar convites por email (para aluno)
  getConvitesByEmail: async (email) => {
    try {
      console.log('🔄 Buscando convites para:', email);
      
      // ⭐⭐ CORREÇÃO: Use a nova rota com email
      const response = await api.get(`/convites/email/${encodeURIComponent(email)}`);
      
      console.log('✅ Convites carregados:', response.data.data?.length || 0);
      return response.data.data || [];
      
    } catch (error) {
      console.error('❌ Erro ao carregar convites:', {
        status: error.response?.status,
        message: error.message
      });
      
      // Fallback para não quebrar
      return [];
    }
  },

  // Aceitar convite
  aceitarConvite: async (idConvite) => {
    try {
      const res = await api.post(`/convites/${idConvite}/aceitar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
      return { success: false, error: err.message };
    }
  },

  // Negar convite
  negarConvite: async (idConvite) => {
    try {
      const res = await api.post(`/convites/${idConvite}/negar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao negar convite:", err);
      return { success: false, error: err.message };
    }
  },

  // Criar convite (personal para aluno)
  criarConvite: async (email) => {
    try {
      const res = await api.post(`/convites/criar`, { email });
      return res.data;
    } catch (err) {
      console.error("Erro ao criar convite", err);
      throw err;
    }
  },

  // NOVO: Enviar convite bidirecional (aluno para personal ou vice-versa)
  enviarConvite: async (dadosConvite) => {
    try {
      const res = await api.post('/convite', dadosConvite);
      return res.data;
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      
      // Tratamento específico de erros
      if (err.response && err.response.data) {
        throw new Error(err.response.data.error || 'Erro ao enviar convite');
      }
      
      throw err;
    }
  },

  // NOVO: Buscar meus convites (todos os convites do usuário atual)
  getMeusConvites: async () => {
    try {
      const res = await api.get('/meus-convites');
      return res.data.success ? res.data.data : [];
    } catch (err) {
      console.error("Erro ao buscar meus convites:", err);
      return [];
    }
  },

  // NOVO: Buscar convites pendentes que eu enviei
  getConvitesEnviados: async () => {
    try {
      const res = await api.get('/meus-convites?tipo=enviados');
      return res.data.success ? res.data.data : [];
    } catch (err) {
      console.error("Erro ao buscar convites enviados:", err);
      return [];
    }
  },

  // NOVO: Buscar convites pendentes que recebi
  getConvitesRecebidos: async () => {
    try {
      const res = await api.get('/meus-convites?tipo=recebidos');
      return res.data.success ? res.data.data : [];
    } catch (err) {
      console.error("Erro ao buscar convites recebidos:", err);
      return [];
    }
  },

  // NOVO: Cancelar convite que enviei
  cancelarConvite: async (idConvite) => {
    try {
      const res = await api.delete(`/convites/${idConvite}/cancelar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao cancelar convite:", err);
      return { success: false, error: err.message };
    }
  },

  // NOVO: Verificar se já existe convite pendente entre usuários
  verificarConvitePendente: async (idRemetente, tipoRemetente, idDestinatario, tipoDestinatario) => {
    try {
      const res = await api.get(`/convites/verificar-pendente`, {
        params: {
          id_remetente: idRemetente,
          tipo_remetente: tipoRemetente,
          id_destinatario: idDestinatario,
          tipo_destinatario: tipoDestinatario
        }
      });
      return res.data;
    } catch (err) {
      console.error("Erro ao verificar convite pendente:", err);
      return { success: false, existe: false };
    }
  },

  // NOVO: Buscar estatísticas de convites
  getEstatisticasConvites: async () => {
    try {
      const res = await api.get('/convites/estatisticas');
      return res.data.success ? res.data.data : {};
    } catch (err) {
      console.error("Erro ao buscar estatísticas de convites:", err);
      return {};
    }
  }
};

export default convitesService;