import api from "../api";

// cadastrar aluno
export const cadastrarAluno = async (dados) => {
  try {
    const response = await api.post("/cadastro/aluno", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    throw error;
  }
};

// cadastrar personal
export const cadastrarPersonal = async (dados) => {
  try {
    const response = await api.post("/cadastro/personal", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar personal:", error);
    throw error;
  }
};

// cadastrar academia - FUNÇÃO ADICIONADA
export const cadastrarAcademia = async (dados) => {
  try {
    const response = await api.post("/cadastro/academia", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar academia:", error);
    throw error;
  }
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

// verificar se o RG já existe
export const verificarRg = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-rg", dados);
    return res.data; // { success: true, disponivel: true/false, rg: "..." }
  } catch (err) {
    console.error("Erro ao verificar RG:", err);
    return { success: false, disponivel: false };
  }
};

// verificar se o CNPJ já existe - FUNÇÃO ADICIONADA
export const verificarCnpj = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-cnpj", dados);
    return res.data; // { success: true, disponivel: true/false, cnpj: "..." }
  } catch (err) {
    console.error("Erro ao verificar CNPJ:", err);
    return { success: false, disponivel: false };
  }
};

// buscar academias ativas para select
export const buscarAcademiasAtivas = async () => {
  try {
    const response = await api.get("/academias-ativas");
    return response.data; // { success: true, data: [...] }
  } catch (error) {
    console.error("Erro ao buscar academias:", error);
    return { success: false, data: [] };
  }
};