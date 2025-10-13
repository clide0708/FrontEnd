import api from "../api";

const perfilService = {
  getPerfil: async (email) => {
    try {
      const response = await api.get(`/perfil/usuario/${email}`);
      return response.data;
    } catch (err) {
      console.error(
        "Erro ao buscar perfil:",
        err.response?.data || err.message
      );
      return null;
    }
  },

  atualizarPerfil: async (data) => {
    try {
      const response = await api.put(`/perfil/atualizar`, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err) {
      console.error(
        "Erro ao atualizar perfil:",
        err.response?.data || err.message
      );
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  },
  getPersonalPorId: async (id) => {
    try {
      const response = await api.get(`/perfil/personalNM/${id}`);
      return response.data;
    } catch (err) {
      console.error(
        "Erro ao buscar personal:",
        err.response?.data || err.message
      );
      return null;
    }
  },

  getHistoricoTreinos: async () => {
    try {
      const response = await api.get('/perfil/historico-treinos');
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return { success: false, historico: [] };
    }
  },

  retomarTreino: async (idSessao) => {
    try {
      const response = await api.get(`/perfil/retomar-treino/${idSessao}`);
      return response.data;
    } catch (err) {
      console.error('Erro ao retomar treino:', err);
      return { success: false };
    }
  },
};
export default perfilService;