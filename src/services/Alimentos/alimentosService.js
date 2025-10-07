import api from "../api";

class AlimentosService {
  // Buscar alimentos com tratamento de erro melhorado
  async buscarAlimentos(nome) {
    try {
      console.log("🔍 Buscando alimentos:", nome);
      const response = await api.get(`/alimentos/buscar?nome=${encodeURIComponent(nome)}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar alimentos');
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao buscar alimentos:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // ✅ CORREÇÃO: Criar refeição com data formatada corretamente para o Brasil
  async criarRefeicao(nomeTipo, dataRef = null) {
    try {
      // ✅ CORREÇÃO: Usar data local formatada corretamente
      let dataParaEnvio;
      
      if (dataRef) {
        // Se já veio uma data, usa ela
        dataParaEnvio = dataRef;
      } else {
        // Cria data no fuso horário de Brasília
        const agora = new Date();
        
        // ✅ CORREÇÃO: Formatar data no padrão MySQL (YYYY-MM-DD HH:MM:SS) no fuso do Brasil
        const offset = -3; // UTC-3 para Brasília
        const localTime = new Date(agora.getTime() + (offset * 60 * 60 * 1000));
        
        const ano = localTime.getUTCFullYear();
        const mes = String(localTime.getUTCMonth() + 1).padStart(2, '0');
        const dia = String(localTime.getUTCDate()).padStart(2, '0');
        const horas = String(localTime.getUTCHours()).padStart(2, '0');
        const minutos = String(localTime.getUTCMinutes()).padStart(2, '0');
        const segundos = String(localTime.getUTCSeconds()).padStart(2, '0');
        
        dataParaEnvio = `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
        
        console.log("🕐 Data formatada para envio:", dataParaEnvio);
      }
      
      const data = {
        nome_tipo: nomeTipo,
        data_ref: dataParaEnvio
      };
      
      console.log("🍽️ Criando refeição:", data);
      const response = await api.post('/alimentos/criar-refeicao', data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao criar refeição');
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao criar refeição:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // ✅ CORREÇÃO: Melhorar o listarRefeicoesHoje para debug
  async listarRefeicoesHoje() {
    try {
      console.log("📅 Buscando refeições de hoje...");
      const response = await api.get('/alimentos/refeicoes-hoje');
      
      console.log("📨 Resposta completa:", response.data);
      
      if (!response.data.success) {
        console.error("❌ Erro na resposta:", response.data.error);
        throw new Error(response.data.error || 'Erro ao buscar refeições');
      }
      
      // ✅ DEBUG: Log detalhado das refeições
      if (response.data.refeicoes && response.data.refeicoes.length > 0) {
        console.log("📊 Detalhes das refeições encontradas:");
        response.data.refeicoes.forEach((ref, index) => {
          console.log(`   ${index + 1}. ${ref.nome_tipo} - ID: ${ref.id} - Data: ${ref.data_ref}`);
        });
      } else {
        console.log("📭 Nenhuma refeição encontrada para hoje");
      }
      
      console.log(`✅ ${response.data.refeicoes?.length || 0} refeições encontradas`);
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao buscar refeições:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // ... o resto do código permanece igual

  // Adicionar alimento com estrutura consistente
  async addAlimento(alimentoData) {
    try {
      console.log("➕ Adicionando alimento:", alimentoData);
      const response = await api.post('/alimentos/adicionar', alimentoData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao adicionar alimento');
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao adicionar alimento:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Listar alimentos de uma refeição específica
  async listarAlimentosRefeicao(idRefeicao) {
    try {
      console.log("📋 Buscando alimentos da refeição:", idRefeicao);
      const response = await api.get(`/alimentos/refeicao/alimentos?id_refeicao=${idRefeicao}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar alimentos da refeição');
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao buscar alimentos da refeição:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Buscar informações detalhadas do alimento
  async buscarInformacaoAlimento(id, quantidade = 100, unidade = 'g') {
    try {
      console.log("🔍 Buscando informações do alimento ID:", id);
      const response = await api.get(`/alimentos/informacao?id=${id}&quantidade=${quantidade}&unidade=${unidade}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar informações do alimento');
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao buscar informações do alimento:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Atualizar alimento
  async updAlimento(alimentoData) {
    try {
      console.log("✏️ Atualizando alimento:", alimentoData);
      const response = await api.put('/alimentos/atualizar', alimentoData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao atualizar alimento');
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao atualizar alimento:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Remover alimento
  async rmvAlimento(alimentoId) {
    try {
      console.log("🗑️ Removendo alimento ID:", alimentoId);
      const response = await api.delete('/alimentos/remover', {
        data: { id: alimentoId }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao remover alimento');
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao remover alimento:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Tratamento centralizado de erros
  tratarErroAPI(error) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return 'Erro de conexão. Verifique sua internet.';
    }
    
    if (error.response?.status === 401) {
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (error.response?.status === 500) {
      return 'Erro interno do servidor. Tente novamente.';
    }
    
    return error.message || 'Erro desconhecido';
  }
}

export default new AlimentosService();