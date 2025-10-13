import api from "../api";

// cadastrar aluno
export const cadastrarAluno = async (dados) => {
  return await api.post("/cadastro/aluno", dados);
};

// cadastrar personal
export const cadastrarPersonal = async (dados) => {
  return await api.post("/cadastro/personal", dados);
};

// verificar se o email já existe
export const verificarEmail = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-email", dados);
    return res.data; // { success: true, disponivel: true/false, email: "..." }
  } catch (err) {
    console.error("Erro ao verificar email:", err);
    return { success: false, disponivel: false };
  }
};

// verificar se o CPF já existe
export const verificarCpf = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-cpf", dados);
    return res.data; // { success: true, disponivel: true/false, cpf: "..." }
  } catch (err) {
    console.error("Erro ao verificar CPF:", err);
    return { success: false, disponivel: false };
  }
};
