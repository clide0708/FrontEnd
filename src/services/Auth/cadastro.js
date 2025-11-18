import api from "../api";

export const cadastrarAluno = async (dados) => {
  try {
    console.log('🔄 Enviando dados para cadastro de aluno:', dados);
    const response = await api.post("/cadastro/aluno", dados);
    console.log('✅ Resposta do cadastro:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro detalhado ao cadastrar aluno:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    throw error;
  }
};

export const cadastrarPersonal = async (dados) => {
  try {
    const response = await api.post("/cadastro/personal", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar personal:", error);
    throw error;
  }
};

export const cadastrarAcademia = async (dados) => {
  try {
    console.log('🔄 Enviando dados para cadastro de academia:', dados);
    const response = await api.post("/cadastro/academia", dados);
    console.log('✅ Resposta do cadastro academia:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro detalhado ao cadastrar academia:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    throw error;
  }
};

export const verificarEmail = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-email", dados);
    return res.data; // { success: true, disponivel: true/false, email: "..." }
  } catch (err) {
    console.error("Erro ao verificar email:", err);
    return { success: false, disponivel: false };
  }
};

export const verificarCpf = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-cpf", dados);
    return res.data; // { success: true, disponivel: true/false, cpf: "..." }
  } catch (err) {
    console.error("Erro ao verificar CPF:", err);
    return { success: false, disponivel: false };
  }
};

export const verificarRg = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-rg", dados);
    return res.data; // { success: true, disponivel: true/false, rg: "..." }
  } catch (err) {
    console.error("Erro ao verificar RG:", err);
    return { success: false, disponivel: false };
  }
};

export const verificarCnpj = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-cnpj", dados);
    return res.data; // { success: true, disponivel: true/false, cnpj: "..." }
  } catch (err) {
    console.error("Erro ao verificar CNPJ:", err);
    return { success: false, disponivel: false };
  }
};

export const buscarAcademiasAtivas = async () => {
  try {
    const response = await api.get("/academias-ativas");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar academias:", error);
    return { success: false, data: [] };
  }
};