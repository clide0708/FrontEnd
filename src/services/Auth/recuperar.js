import api from "../api";

const recuperarSenhaService = {
  esqueciSenha: async (email) => {
    try {
      // Para rotas públicas, não usar withCredentials
      const response = await api.post(`/recuperacao-senha/esqueci-senha`, { 
        email 
      }, {
        withCredentials: false // IMPORTANTE: desabilita credentials para rotas públicas
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      throw error;
    }
  },

  resetarSenha: async (email, codigo, novaSenha) => {
    try {
      const response = await api.post(`/recuperacao-senha/resetar-senha`, {
        email,
        codigo,
        nova_senha: novaSenha,
      }, {
        withCredentials: false // IMPORTANTE: desabilita credentials para rotas públicas
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      throw error;
    }
  }
};

export default recuperarSenhaService;