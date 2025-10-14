import api from '../api';

const exerciciosPersonalService = {
  // Buscar exercícios normais do personal
  buscarMeusExercicios: async () => {
    try {
      const response = await api.get('/exercicios/normais');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar meus exercícios:', error);
      // Retorna array vazio em caso de erro para não quebrar a aplicação
      return [];
    }
  },

  // Buscar exercícios adaptados do personal
  buscarMeusExerciciosAdaptados: async () => {
    try {
      const response = await api.get('/exercicios/adaptados');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar exercícios adaptados:', error);
      // Retorna array vazio em caso de erro para não quebrar a aplicação
      return [];
    }
  },

  // Cadastrar novo exercício (normal ou adaptado)
  cadastrarExercicio: async (dadosExercicio) => {
    try {
      const response = await api.post('/exercicios/cadastrar-personal', dadosExercicio);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar exercício:', error);
      throw error;
    }
  },

  buscarMeusExerciciosPorTipo: async (tipo) => {
    try {
      const response = await api.get(`/exercicios/por-tipo/${tipo}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar exercícios do tipo ${tipo}:`, error);
      return [];
    }
  },
};

export default exerciciosPersonalService;