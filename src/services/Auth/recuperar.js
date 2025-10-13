import api from "../api";

const recuperarSenhaService = {
  esqueciSenha: (email) => {
    return api.post(`/recuperacao-senha/esqueci-senha`, { email });
  },

  resetarSenha: (email, codigo, novaSenha) => {
    return api.post(`/recuperacao-senha/resetar-senha`, {
      email,
      codigo,
      nova_senha: novaSenha,
    });
  },
};

export default recuperarSenhaService;
