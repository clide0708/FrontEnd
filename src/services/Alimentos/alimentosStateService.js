import { 
  listarRefeicoesHoje, 
  criarRefeicao, 
  addAlimento,
  buscarInformacaoAlimento,
  updAlimento,
  rmvAlimento
} from "./alimentosService";

class AlimentosStateService {
  constructor() {
    this.refeicoes = [];
    this.carregando = false;
    this.erro = null;
    this.listeners = [];
  }

  // Inscrever componentes para atualizações
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar todos os componentes inscritos
  notify() {
    this.listeners.forEach(listener => listener());
  }

  // Carregar refeições
  async carregarRefeicoes() {
    this.carregando = true;
    this.erro = null;
    this.notify();

    try {
      const response = await listarRefeicoesHoje();
      this.refeicoes = response.refeicoes || [];
    } catch (error) {
      this.erro = error.message;
      console.error('Erro ao carregar refeições:', error);
    } finally {
      this.carregando = false;
      this.notify();
    }
  }

  // Criar refeição
  async criarRefeicao(nomeTipo) {
    try {
      const response = await criarRefeicao(nomeTipo);
      await this.carregarRefeicoes(); // Recarrega automaticamente
      return response;
    } catch (error) {
      this.erro = error.message;
      this.notify();
      throw error;
    }
  }

  // Adicionar alimento
  async adicionarAlimento(alimentoData) {
    try {
      const response = await addAlimento(alimentoData);
      await this.carregarRefeicoes(); // Recarrega automaticamente
      return response;
    } catch (error) {
      this.erro = error.message;
      this.notify();
      throw error;
    }
  }

  // Buscar informações detalhadas do alimento
  async buscarInformacaoAlimento(id, quantidade = 100, unidade = 'g') {
    try {
      console.log("🔍 Buscando informações do alimento ID:", id);
      const response = await buscarInformacaoAlimento(id, quantidade, unidade);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao buscar informações do alimento');
      }
      
      return response;
    } catch (error) {
      console.error("❌ Erro ao buscar informações do alimento:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Atualizar alimento
  async updAlimento(alimentoData) {
    try {
      console.log("✏️ Atualizando alimento:", alimentoData);
      const response = await updAlimento(alimentoData);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao atualizar alimento');
      }
      
      await this.carregarRefeicoes(); // Recarrega automaticamente
      return response;
    } catch (error) {
      console.error("❌ Erro ao atualizar alimento:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Remover alimento
  async rmvAlimento(alimentoId) {
    try {
      console.log("🗑️ Removendo alimento ID:", alimentoId);
      const response = await rmvAlimento(alimentoId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao remover alimento');
      }
      
      await this.carregarRefeicoes(); // Recarrega automaticamente
      return response;
    } catch (error) {
      console.error("❌ Erro ao remover alimento:", error);
      throw new Error(this.tratarErroAPI(error));
    }
  }

  // Getters
  getRefeicoes() {
    return this.refeicoes;
  }

  getCarregando() {
    return this.carregando;
  }

  getErro() {
    return this.erro;
  }

  // Calcular totais
  calcularTotais() {
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;

    this.refeicoes.forEach(refeicao => {
      totalCalorias += refeicao.totais?.calorias || 0;
      totalProteinas += refeicao.totais?.proteinas || 0;
      totalCarboidratos += refeicao.totais?.carboidratos || 0;
      totalGorduras += refeicao.totais?.gorduras || 0;
    });

    return { totalCalorias, totalProteinas, totalCarboidratos, totalGorduras };
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

// Singleton - uma única instância para toda a aplicação
export default new AlimentosStateService();