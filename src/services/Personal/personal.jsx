import api from "../api";

const treinosService = {
  // pega todos os treinos do personal
  async getTreinosPersonal(idPersonal) {
    try {
      const response = await api.get(`/treinos/personal/${idPersonal}`);
      return response.data.meusTreinos || []; // garante array
    } catch (error) {
      console.error("Erro ao buscar treinos do personal:", error);
      return [];
    }
  },

  // pega todos os alunos do personal
  async getAlunosPersonal(idPersonal) {
    try {
      const response = await api.get(`/perfil/personal/${idPersonal}/alunos`);
      return response.data.data || []; // garante array
    } catch (error) {
      console.error("Erro ao buscar alunos do personal:", error);
      return [];
    }
  },

  // pega treinos atribuídos de um aluno específico pelo personal
  async getTreinosAluno(idAluno) {
    try {
      const response = await api.get(`/treinos/aluno/personal/${idAluno}`);
      return response.data.treinosAtribuidos || []; // garante array
    } catch (error) {
      console.error("Erro ao buscar treinos do aluno:", error);
      return [];
    }
  },

  // cria um treino novo
  async addTreino(dadosTreino) {
    try {
      const response = await api.post("/treinos", dadosTreino);
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar treino:", error);
      throw error;
    }
  },

  // edita um treino existente
  async updateTreino(idTreino, dadosTreino) {
    try {
      const response = await api.put(`/treinos/${idTreino}`, dadosTreino);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar treino:", error);
      throw error;
    }
  },

  // deleta um treino
  async deleteTreino(idTreino) {
    try {
      const response = await api.delete(`/treinos/${idTreino}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar treino:", error);
      throw error;
    }
  },
};

export default treinosService;
