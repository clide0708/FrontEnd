import api from "../api";

let cache = {
    alunos: null,
    personais: null,
    academias: null,
    modalidades: null,
    timestamp: null
};

const CACHE_DURATION = 30000; // 30 segundos

const conectarService = {
  
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
    const now = Date.now();
    const cacheKey = `alunos_${JSON.stringify(filtros)}`;
    
    // ⭐⭐ CORREÇÃO: Usa cache se disponível e recente
    if (cache[cacheKey] && (now - cache.timestamp) < CACHE_DURATION) {
        console.log('📦 Retornando dados do cache');
        return cache[cacheKey];
    }
    
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

        console.log('🔄 Buscando alunos com params:', params.toString());
        const response = await api.get(`/alunos?${params.toString()}`);
        
        console.log('✅ Resposta completa da API:', response.data);
        
        const dados = response.data.data || [];
        
        // ⭐⭐ CORREÇÃO: Salva no cache
        cache[cacheKey] = dados;
        cache.timestamp = now;
        
        return dados;
        
    } catch (error) {
        console.error('❌ Erro ao buscar alunos:', error);
        throw error;
    }
  },

  // Buscar academias
  async getAcademias() {
    try {
      console.log('🔄 Buscando academias ativas...');
      const response = await api.get('/academias-ativas');
      
      if (response.data && response.data.success) {
        console.log('✅ Academias carregadas:', response.data.data?.length || 0);
        return response.data.data || [];
      } else {
        console.warn('⚠️ Resposta inesperada de academias:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar academias:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      
      // Fallback com array vazio para não quebrar a aplicação
      return [];
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