import api from "../api";

// Obter usuário do localStorage
const getUsuario = () => {
  const usuarioStr = localStorage.getItem('usuario');
  return usuarioStr ? JSON.parse(usuarioStr) : null;
};

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

  // pega treinos atribuídos de um aluno específico - CORRIGIDO
  async getTreinosAluno(idAluno) {
    try {
      const usuario = getUsuario();
      if (!usuario) {
        console.error("Usuário não encontrado no localStorage");
        return [];
      }
      
      const response = await api.get(`/treinos/personal/${usuario.id}/aluno/${idAluno}`);
      return response.data.treinos || [];
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
      const response = await api.put(`/treinos/excluir/${idTreino}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao desatribuir treino:", error);
      throw error;
    }
  },

  // cria um treino novo
  async addTreino(dadosTreino) {
    try {
      const response = await api.post("/treinos/criar", dadosTreino);
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar treino:", error);
      throw error;
    }
  },

  // edita um treino existente
  async updateTreino(idTreino, dadosTreino) {
    try {
      const response = await api.put(`/treinos/atualizar/${idTreino}`, dadosTreino);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar treino:", error);
      throw error;
    }
  },

  // deleta um treino
  async deleteTreino(idTreino) {
    try {
      const response = await api.delete(`/treinos/excluir/${idTreino}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar treino:", error);
      throw error;
    }
  },

  desvincularAluno: async (idPersonal, idAluno) => {
    try {
      const res = await api.delete(`/personal/${idPersonal}/desvincular-aluno/${idAluno}`);
      return res.data;
    } catch (err) {
      console.error("Erro na rota de desvincular aluno", err);
      throw err;
    }
  },
};

export default personalService;