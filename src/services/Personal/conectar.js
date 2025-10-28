import api from "../api";

const conectarService = {
  // Buscar personais com filtros
  async getPersonais(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros não vazios
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await api.get(`/personais?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar personais:', error);
      throw error;
    }
  },

  // Buscar academias
  async getAcademias() {
    try {
      const response = await api.get('/academias');
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar academias:', error);
      throw error;
    }
  },

  // Enviar convite
  async enviarConvite(dadosConvite) {
    try {
      const response = await api.post('/convite', dadosConvite);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      throw error;
    }
  },

  // Verificar convites pendentes do usuário atual
  async getMeusConvites() {
    try {
      const response = await api.get('/meus-convites');
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      throw error;
    }
  }
};

export default conectarService;