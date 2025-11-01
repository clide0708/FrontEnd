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
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        } else if (error.response.status === 404) {
          return [];
        }
      }
      
      throw error;
    }
  },

  // Buscar alunos com filtros
  async getAlunos(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
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

      const response = await api.get(`/alunos?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        } else if (error.response.status === 404) {
          return [];
        }
      }
      
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

  // Buscar modalidades
  async getModalidades() {
    try {
      const response = await api.get('/modalidades');
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
      return [];
    }
  },

  // Enviar convite
  async enviarConvite(dadosConvite) {
    try {
      const response = await api.post('/convite', dadosConvite);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Erro ao enviar convite');
      }
      
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
  },

  // Aceitar convite
  async aceitarConvite(idConvite) {
    try {
      const response = await api.post(`/convites/${idConvite}/aceitar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      throw error;
    }
  },

  // Negar convite
  async negarConvite(idConvite) {
    try {
      const response = await api.post(`/convites/${idConvite}/negar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao negar convite:', error);
      throw error;
    }
  },

  // Buscar academias ativas
  async getAcademiasAtivas() {
    try {
      const response = await api.get('/academias-ativas');
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar academias ativas:', error);
      return [];
    }
  }
};

export default conectarService;