import api from "../api";

const recuperarSenhaService = {
  esqueciSenha: async (email) => {
    try {
      const response = await api.post(`/recuperacao-senha/esqueci-senha`, { email });
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
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      throw error;
    }
  },

  // Nova função para validar código
  validarCodigo: async (email, codigo) => {
    try {
      // Esta é uma implementação básica - você pode precisar criar um endpoint específico
      const response = await api.post(`/recuperacao-senha/validar-codigo`, {
        email,
        codigo
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao validar código:", error);
      throw error;
    }
  }
};

export default recuperarSenhaService;