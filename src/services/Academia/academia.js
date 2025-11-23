// services/Academia/academia.js
import api from "../api";

const academiaService = {
  // Buscar painel de controle da academia - CORREÇÃO AQUI
  async getPainelControle() {
    try {
      console.log('🔄 Buscando painel da academia...');
      const response = await api.get('/academia/painel');
      console.log('✅ Resposta do painel:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar painel:', error);
      console.error('Detalhes do erro:', error.response?.data);
      throw error;
    }
  },

  // ENVIAR solicitação de vinculação
  async enviarSolicitacaoVinculacao(dados) {
    try {
      const response = await api.post('/academia/solicitacao/enviar', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      throw error;
    }
  },

  // Aceitar solicitação
  async aceitarSolicitacao(idSolicitacao) {
    try {
      const response = await api.post(`/academia/solicitacao/${idSolicitacao}/aceitar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      throw error;
    }
  },

  // Recusar solicitação
  async recusarSolicitacao(idSolicitacao, mensagem = null) {
    try {
      const response = await api.post(`/academia/solicitacao/${idSolicitacao}/recusar`, {
        mensagem
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
      throw error;
    }
  },

  // Desvincular usuário
  async desvincularUsuario(dados) {
    try {
      const response = await api.post('/academia/desvincular', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao desvincular usuário:', error);
      throw error;
    }
  },

  // Listar academias ativas
  async listarAcademiasAtivas() {
    try {
      const response = await api.get('/academias-ativas');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar academias:', error);
      throw error;
    }
  }

};

export default academiaService;