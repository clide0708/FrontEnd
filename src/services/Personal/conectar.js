import api from "../api";
import enderecoService from "../Endereco/endereco";

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
      
      // ⭐⭐ CORREÇÃO: Adicionar todos os filtros de forma consistente
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        
        // Ignorar valores vazios, null ou undefined
        if (value === null || value === undefined || value === '') {
          return;
        }
        
        // Tratar arrays (modalidades)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Para arrays, enviar como string separada por vírgulas
            params.append(key, value.join(','));
          }
        } else {
          // Para valores simples
          params.append(key, value);
        }
      });

      console.log('🔍 Buscando personais com params:', params.toString());
      
      const response = await api.get(`/personais?${params.toString()}`);
      
      console.log('✅ Resposta personais:', {
        success: response.data.success,
        total: response.data.total,
        data: response.data.data?.length || 0
      });
      
      return response.data.data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar personais:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      
      throw error;
    }
  },

  // Buscar alunos com filtros
  async getAlunos(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // ⭐⭐ CORREÇÃO: Adicionar todos os filtros de forma consistente
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        
        // Ignorar valores vazios, null ou undefined
        if (value === null || value === undefined || value === '') {
          return;
        }
        
        // Tratar arrays (modalidades)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Para arrays, enviar como string separada por vírgulas
            params.append(key, value.join(','));
          }
        } else {
          // Para valores simples
          params.append(key, value);
        }
      });

      console.log('🔍 Buscando alunos com params:', params.toString());
      
      const response = await api.get(`/alunos?${params.toString()}`);
      
      console.log('✅ Resposta alunos:', {
        success: response.data.success,
        total: response.data.total,
        data: response.data.data?.length || 0
      });
      
      return response.data.data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar alunos:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      
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
  },

  obterEnderecoUsuario: async (usuario) => {
  try {
    const response = await enderecoService.getEnderecoPorEmail(usuario.email);
    if (response.success) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar endereço do usuário:', error);
    return null;
  }
},

  // Obter coordenadas por CEP
  async obterCoordenadasPorCEP(cep) {
    try {
      const response = await api.get(`/conectar/coordenadas/${cep}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error);
      throw error;
    }
  },

  geocodificarEndereco: async (endereco) => {
    try {
      console.log('🌍 Geocodificando endereço:', endereco);
      
      // Adicionar delay para respeitar os termos de uso do OpenStreetMap
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1&countrycodes=br&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📊 Resposta geocodificação:', data);
      
      if (data && data.length > 0) {
        const resultado = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          endereco_formatado: data[0].display_name,
          cidade: data[0].address?.city || data[0].address?.town || data[0].address?.municipality,
          estado: data[0].address?.state,
          cep: data[0].address?.postcode
        };
        
        console.log('✅ Endereço geocodificado:', resultado);
        return resultado;
      }
      
      console.log('⚠️ Nenhum resultado encontrado para:', endereco);
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao geocodificar endereço:', error);
      return null;
    }
  },

  // Método para buscar coordenadas do usuário logado
  obterCoordenadasUsuario: async (usuario) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.log('❌ Geolocalização não suportada pelo navegador');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            tipo: 'geolocalizacao',
            descricao: 'Sua localização atual'
          };
          console.log('📍 Coordenadas obtidas:', coords);
          resolve(coords);
        },
        (error) => {
          console.log('❌ Erro na geolocalização:', error.message);
          // Não rejeitar, apenas retornar null para usar fallback
          resolve(null);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    });
  },

  // Fallback: buscar cidade/estado do usuário e geocodificar
  obterCoordenadasFallback: async (usuario) => {
    try {
      // Buscar endereço completo do usuário
      const endereco = await conectarService.obterEnderecoUsuario(usuario);
      
      if (endereco) {
        const valido = enderecoService.validarEnderecoParaDistancia(endereco);
        
        if (valido === true) {
          // Endereço completo - geocodificar com precisão
          const enderecoCompleto = `${endereco.logradouro}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}`;
          const coordenadas = await conectarService.geocodificarEndereco(enderecoCompleto);
          
          if (coordenadas) {
            return {
              latitude: coordenadas.latitude,
              longitude: coordenadas.longitude,
              tipo: 'endereco_cadastrado',
              descricao: enderecoCompleto,
              precisao: 'alta'
            };
          }
        } else if (valido === 'aproximado') {
          // Apenas cidade/estado - geocodificar com precisão baixa
          const localizacao = `${endereco.cidade}, ${endereco.estado}`;
          const coordenadas = await conectarService.geocodificarEndereco(localizacao);
          
          if (coordenadas) {
            return {
              latitude: coordenadas.latitude,
              longitude: coordenadas.longitude,
              tipo: 'endereco_aproximado',
              descricao: localizacao,
              precisao: 'baixa'
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro no fallback de coordenadas:', error);
      return null;
    }
  },
};

export default conectarService;