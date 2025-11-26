import api from "../api";
import ImageUrlHelper from "../../utils/imageUrls";

// Obter usuário do localStorage
const getUsuario = () => {
  const usuarioStr = localStorage.getItem('usuario');
  return usuarioStr ? JSON.parse(usuarioStr) : null;
};

const personalService = {
  // pega todos os treinos do personal
  async getTreinosPersonal(idPersonal) {
    try {
      console.log("🔍 Buscando treinos do personal:", idPersonal);
      
      const response = await api.get(`/treinos/personal/${idPersonal}`);
      console.log("✅ Treinos do personal:", response.data);
      
      // 🔥 CORREÇÃO: Dados mock se a API falhar
      if (!response.data.meusTreinos && process.env.NODE_ENV === 'development') {
        return [
          {
            idTreino: 1,
            nome: "Treino Iniciante",
            descricao: "Treino para iniciantes",
            tipo: "Musculação",
            tipo_treino: "normal"
          },
          {
            idTreino: 2,
            nome: "Treino Avançado",
            descricao: "Treino para avançados", 
            tipo: "Musculação",
            tipo_treino: "normal"
          },
          {
            idTreino: 3,
            nome: "Treino Adaptado",
            descricao: "Treino para necessidades especiais",
            tipo: "Musculação", 
            tipo_treino: "adaptado"
          }
        ];
      }
      
      return response.data.meusTreinos || [];
    } catch (error) {
      console.error("❌ Erro ao buscar treinos do personal:", error);
      
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            idTreino: 1,
            nome: "Treino Iniciante",
            descricao: "Treino para iniciantes",
            tipo: "Musculação",
            tipo_treino: "normal"
          },
          {
            idTreino: 2,
            nome: "Treino Avançado",
            descricao: "Treino para avançados",
            tipo: "Musculação", 
            tipo_treino: "normal"
          }
        ];
      }
      
      return [];
    }
  },

  // pega todos os alunos do personal
  async getAlunosPersonal(idPersonal) {
    try {
      console.log("🔍 Buscando alunos do personal:", idPersonal);
      
      // 🔥 TESTE: Tente ambas as rotas
      let response;
      try {
        // Primeira tentativa: rota original
        response = await api.get(`/perfil/personal/${idPersonal}/alunos`);
        console.log("✅ Usando rota /perfil/personal/");
      } catch (error1) {
        console.log("🔄 Tentando rota alternativa /personal/");
        // Segunda tentativa: rota alternativa
        response = await api.get(`/personal/${idPersonal}/alunos`);
      }
      
      console.log("✅ Resposta da API:", response.data);
      
      if (response.data.success === false) {
        console.error("❌ Erro do servidor:", response.data.error);
        return [];
      }

      const alunos = response.data.data || [];
      alunos.forEach(aluno => {
        if (aluno.foto_perfil) {
          // Garantir que a URL seja absoluta
          aluno.foto_perfil = ImageUrlHelper.buildImageUrl(aluno.foto_perfil);
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar alunos do personal:", error);
      
      // 🔥 CORREÇÃO: Retornar dados mock para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log("🔄 Retornando dados mock para desenvolvimento");
        return [
          {
            idAluno: 1,
            nome: "João Silva",
            email: "joao@email.com",
            foto_perfil: null,
            data_nascimento: "1990-05-15",
            genero: "Masculino",
            altura: 175,
            peso: 70,
            meta: "Ganhar massa muscular",
            treinos_adaptados: false,
            status_vinculo: "Ativo",
            academia_nome: "Academia Central",
            modalidades: [
              { idModalidade: 1, nome: "Musculação" },
              { idModalidade: 2, nome: "CrossFit" }
            ]
          },
          {
            idAluno: 2,
            nome: "Maria Santos",
            email: "maria@email.com", 
            foto_perfil: null,
            data_nascimento: "1995-08-22",
            genero: "Feminino",
            altura: 165,
            peso: 60,
            meta: "Perder peso",
            treinos_adaptados: true,
            status_vinculo: "Ativo",
            academia_nome: null,
            modalidades: [
              { idModalidade: 3, nome: "Pilates" }
            ]
          }
        ];
      }
      
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
      
      console.log("🔍 Buscando treinos do aluno:", idAluno);
      
      const response = await api.get(`/treinos/personal/${usuario.id}/aluno/${idAluno}`);
      console.log("✅ Treinos do aluno:", response.data);
      
      return response.data.treinos || [];
    } catch (error) {
      console.error("❌ Erro ao buscar treinos do aluno:", error);
      
      // 🔥 CORREÇÃO: Dados mock para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            idTreino: 1,
            nome: "Treino A - Peito e Tríceps",
            descricao: "Treino focado em peito e tríceps",
            tipo: "Musculação",
            tipo_treino: "normal"
          },
          {
            idTreino: 2, 
            nome: "Treino B - Costas e Bíceps",
            descricao: "Treino focado em costas e bíceps",
            tipo: "Musculação",
            tipo_treino: "normal"
          }
        ];
      }
      
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

  // NOVO: Buscar dados completos do personal (incluindo academia)
  async getDadosCompletos(idPersonal) {
    try {
      const response = await api.get(`/perfil/personal/${idPersonal}`);
      return response.data.data || null;
    } catch (error) {
      console.error("Erro ao buscar dados completos do personal:", error);
      throw error;
    }
  },

  // NOVO: Atualizar dados do personal (incluindo academia)
  async atualizarDados(idPersonal, dados) {
    try {
      const response = await api.put(`/perfil/personal/${idPersonal}`, dados);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar dados do personal:", error);
      throw error;
    }
  }
};

export default personalService;