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

const corrigirJSONCorrompido = (texto) => {
  if (typeof texto !== 'string') return texto;
  
  // Tentar encontrar o JSON válido mais recente
  const jsonMatches = texto.match(/\{.*\}/gs);
  if (jsonMatches && jsonMatches.length > 0) {
    // Pegar o último JSON válido (o mais recente)
    const ultimoJSON = jsonMatches[jsonMatches.length - 1];
    try {
      return JSON.parse(ultimoJSON);
    } catch (e) {
      console.warn('⚠️ Não foi possível parsear JSON corrompido:', e);
    }
  }
  
  return null;
};

const conectarService = {
  
  getPersonais: async (filtros = {}) => {
    try {
      console.log('🔄 Buscando personais com filtros:', filtros);
      
      const response = await api.get('/personais', { params: filtros });
      console.log('✅ Resposta completa personais:', response);
      
      // 🔥 CORREÇÃO: Verificar estrutura da resposta
      if (response.data && typeof response.data === 'object') {
        // Caso 1: Resposta com estrutura {success: true, data: [...]}
        if (response.data.success === true && Array.isArray(response.data.data)) {
          console.log('✅ Dados encontrados em response.data.data:', response.data.data.length);
          return response.data.data;
        }
        // Caso 2: Dados diretamente no response.data
        else if (Array.isArray(response.data.data)) {
          console.log('✅ Dados encontrados em response.data:', response.data.data.length);
          return response.data.data;
        }
        // Caso 3: Dados diretamente no response.data (array puro)
        else if (Array.isArray(response.data)) {
          console.log('✅ Dados encontrados como array puro:', response.data.length);
          return response.data;
        }
      }
      
      console.warn('⚠️ Estrutura de dados inesperada, retornando array vazio');
      return [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar personais:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // 🔥 CORREÇÃO: Tentar extrair dados mesmo com erro
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (responseData.success === true && Array.isArray(responseData.data)) {
          console.log('✅ Dados recuperados de resposta com erro:', responseData.data.length);
          return responseData.data;
        }
      }
      
      return [];
    }
  },

  // Buscar alunos com filtros
  getAlunos: async (filtros = {}) => {
    try {
      console.log('🔄 Buscando alunos com filtros:', filtros);
      
      const response = await api.get('/alunos', { params: filtros });
      console.log('✅ Resposta RAW alunos:', response.data);
      
      // 🔥 CORREÇÃO: Lidar com JSON corrompido
      let dadosProcessados = response.data;
      
      // Se for string, tentar corrigir JSON corrompido
      if (typeof response.data === 'string') {
        console.warn('⚠️ Resposta é string, tentando corrigir JSON corrompido...');
        dadosProcessados = corrigirJSONCorrompido(response.data);
      }
      
      // Se ainda for string após correção, tentar parsear como JSON
      if (typeof dadosProcessados === 'string') {
        try {
          dadosProcessados = JSON.parse(dadosProcessados);
        } catch (e) {
          console.error('❌ Não foi possível parsear resposta como JSON:', e);
          return [];
        }
      }
      
      console.log('✅ Dados processados alunos:', dadosProcessados);
      
      // Extrair dados do formato correto
      if (dadosProcessados && dadosProcessados.success === true) {
        return Array.isArray(dadosProcessados.data) ? dadosProcessados.data : [];
      }
      
      // Fallback: se não tem estrutura padrão, retornar o próprio array
      if (Array.isArray(dadosProcessados)) {
        return dadosProcessados;
      }
      
      // Fallback: se tem estrutura de dados direta
      if (dadosProcessados && Array.isArray(dadosProcessados.data)) {
        return dadosProcessados.data;
      }
      
      console.warn('⚠️ Estrutura de dados inesperada:', dadosProcessados);
      return [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar alunos:', error);
      
      // 🔥 CORREÇÃO: Tentar extrair dados mesmo com erro de parsing
      if (error.response && typeof error.response.data === 'string') {
        const dadosCorrigidos = corrigirJSONCorrompido(error.response.data);
        if (dadosCorrigidos && dadosCorrigidos.success === true && Array.isArray(dadosCorrigidos.data)) {
          console.log('✅ Dados recuperados de resposta com erro:', dadosCorrigidos.data);
          return dadosCorrigidos.data;
        }
      }
      
      return [];
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
  enviarConvite: async (dadosConvite) => {
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