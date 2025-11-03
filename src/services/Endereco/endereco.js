import api from "../api";

const enderecoService = {
  // Buscar endereço por email
  async getEnderecoPorEmail(email) {
    try {
      const response = await api.get(`/endereco/${email}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Atualizar endereço
  async atualizarEndereco(dados) {
    try {
      const response = await api.post('/endereco/atualizar', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Validar se endereço tem dados suficientes para cálculo de distância
  validarEnderecoParaDistancia(endereco) {
    if (!endereco) return false;
    
    // Para cálculo preciso, precisamos de CEP e número
    if (endereco.cep && endereco.numero && endereco.cidade && endereco.estado) {
      return true;
    }
    
    // Para cálculo aproximado, apenas cidade e estado
    if (endereco.cidade && endereco.estado) {
      return 'aproximado';
    }
    
    return false;
  }
};

export default enderecoService;