import api from "../api";

// Buscar alimentos na API Spoonacular (com tradução)
export const buscarAlimentos = async (nome) => {
  try {
    console.log("Buscando alimentos para:", nome);
    const response = await api.get(`/alimentos/buscar?nome=${encodeURIComponent(nome)}`);
    console.log("Resposta da busca:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro detalhado ao buscar alimentos:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// Buscar informações detalhadas de um alimento
export const buscarInformacaoAlimento = async (id, quantidade = 100, unidade = 'g') => {
  try {
    const response = await api.get(`/alimentos/informacao?id=${id}&quantidade=${quantidade}&unidade=${unidade}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar informação do alimento:", error);
    throw error;
  }
};

// Listar refeições do aluno
export const listarRefeicoes = async (dataRef = null) => {
  try {
    let url = '/alimentos/listar-refeicoes';
    if (dataRef) {
      url += `?data_ref=${dataRef}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Erro ao listar refeições:", error);
    throw error;
  }
};

// Listar refeições simples (para diagnóstico)
export const listarRefeicoesSimples = async () => {
  try {
    const response = await api.get('/alimentos/listar-refeicoes-simples');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar refeições simples:", error);
    throw error;
  }
};

// Criar nova refeição - CORRIGIDO: usando a rota correta
export const criarRefeicao = async (nomeTipo, dataRef = null) => {
  try {
    const data = {
      nome_tipo: nomeTipo,
      data_ref: dataRef || new Date().toISOString()
    };
    const response = await api.post('/alimentos/criar-refeicao', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar refeição:", error);
    throw error;
  }
};

// Adicionar alimento à refeição
export const addAlimento = async (alimentoData) => {
  try {
    const response = await api.post('/alimentos/adicionar', alimentoData);
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar alimento:", error);
    throw error;
  }
};

// Remover alimento
export const rmvAlimento = async (alimentoId) => {
  try {
    const response = await api.delete('/alimentos/remover', {
      data: { id: alimentoId }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao remover alimento:", error);
    throw error;
  }
};

// Atualizar alimento
export const updAlimento = async (alimentoData) => {
  try {
    const response = await api.put('/alimentos/atualizar', alimentoData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar alimento:", error);
    throw error;
  }
};

// Listar totais de nutrientes
export const listarTotais = async () => {
  try {
    const response = await api.get('/alimentos/totais');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar totais de alimentos:", error);
    throw error;
  }
};

// Listar alimentos de uma refeição específica
export const listarAlimentosRefeicao = async (idRefeicao) => {
  try {
    const response = await api.get(`/alimentos/refeicao/alimentos?id_refeicao=${idRefeicao}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao listar alimentos da refeição:", error);
    throw error;
  }
};

// Diagnóstico - para debug
export const diagnosticarRefeicoes = async () => {
  try {
    const response = await api.get('/alimentos/diagnosticar');
    return response.data;
  } catch (error) {
    console.error("Erro no diagnóstico:", error);
    throw error;
  }
};

// Testar tradução
export const testarTraducao = async (texto, de = 'pt', para = 'en') => {
  try {
    const response = await api.get(`/alimentos/testar-traducao?texto=${encodeURIComponent(texto)}&de=${de}&para=${para}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao testar tradução:", error);
    throw error;
  }
};