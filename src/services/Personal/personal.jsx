import api from "../api";

const personalService = {
  // pega todos os treinos do personal
  async getTreinosPersonal(idPersonal) {
    try {
      const response = await api.get(`/treinos/personal/${idPersonal}`);
      return response.data.meusTreinos || [];
    } catch (error) {
      console.error("Erro ao buscar treinos do personal:", error);
      return [];
    }
  },

  // pega todos os alunos do personal
  async getAlunosPersonal(idPersonal) {
    try {
      const response = await api.get(`/perfil/personal/${idPersonal}/alunos`);
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar alunos do personal:", error);
      return [];
    }
  },

  // pega treinos atribuídos de um aluno específico
  async getTreinosAluno(idAluno) {
    try {
      const response = await api.get(`/treinos/aluno/personal/${idAluno}`);
      return response.data.treinosAtribuidos || [];
    } catch (error) {
      console.error("Erro ao buscar treinos do aluno:", error);
      return [];
    }
  },

  // atribui treino a um aluno
  async atribuirTreino(idTreino, idAluno) {
    try {
      const response = await api.post("/treinos/atribuir", {
        idTreino,
        idAluno,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atribuir treino:", error);
      throw error;
    }
  },

  async desatribuirTreino(idTreino) {
    try {
      const response = await api.put(
        `/treinos/excluir/${idTreino}`
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao desatribuir treino:", error);
      throw error;
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

export default personalService;
