import api from "../api";

const convitesService = {
  // Buscar convites por email (para aluno) - MANTIDO para compatibilidade
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

  // Recusar convite
  recusarConvite: async (idConvite) => {
    try {
      const res = await api.post(`/convites/${idConvite}/recusar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao recusar convite:", err);
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

  // Enviar convite bidirecional (aluno para personal ou vice-versa)
  enviarConvite: async (dadosConvite) => {
    try {
      const res = await api.post('/convite', dadosConvite);
      return res.data;
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      
      if (err.response && err.response.data) {
        throw new Error(err.response.data.error || 'Erro ao enviar convite');
      }
      
      throw err;
    }
  },

  // Buscar meus convites (todos os convites do usuário atual)
  getMeusConvites: async () => {
    try {
      const res = await api.get('/meus-convites');
      return res.data.success ? res.data.data : [];
    } catch (err) {
      console.error("Erro ao buscar meus convites:", err);
      return [];
    }
  },

  // Verificar se já existe convite pendente entre usuários
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
  }
};

export default convitesService;