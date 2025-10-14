import api from "../api";

const treinosService = {
  // Criar treino
  criar: async (treino) => {
    const { data } = await api.post("/treinos/criar", treino);
    return {
      idTreino: data.idTreino,
      nome: data.nome || treino.nome,
      descricao: data.descricao || treino.descricao,
      tipo: data.tipo || treino.tipo,
      criadoPor: data.criadoPor || treino.criadoPor,
      exercicios: data.exercicios || [],
      idAluno: data.idAluno || treino.idAluno || null,
      idPersonal: data.idPersonal || treino.idPersonal || null,
      nomeAluno: data.nomeAluno || treino.nomeAluno || null,
    };
  },

  // Editar treino
  editar: async (treino) => {
    if (!treino.idTreino) throw new Error("Treino sem idTreino para editar");

    const { data } = await api.put(
      `/treinos/atualizar/${treino.idTreino}`,
      treino
    );

    return {
      idTreino: data.idTreino || treino.idTreino,
      nome: data.nome || treino.nome,
      descricao: data.descricao || treino.descricao,
      tipo: data.tipo || treino.tipo,
      criadoPor: data.criadoPor || treino.criadoPor,
      exercicios: data.exercicios || treino.exercicios || [],
      idAluno: data.idAluno || treino.idAluno || null,
      idPersonal: data.idPersonal || treino.idPersonal || null,
      nomeAluno: data.nomeAluno || treino.nomeAluno || null,
    };
  },

  // Deletar treino
  deletar: async (idTreino) => {
    const { data } = await api.delete(`/treinos/excluir/${idTreino}`);
    return data;
  },

  // Listar treinos do usuário logado
  listarUsuario: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const { data } = await api.post("/treinos/listarUsuario", {
      idUsuario: usuario.id,
    });
    return data || [];
  },

  // Meus treinos (aluno)
  listarMeus: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const { data } =
      usuario.tipo === "aluno"
        ? await api.get(`/treinos/aluno/${usuario.id}`)
        : await api.get(`/treinos/personal/${usuario.id}`);
    return data.meusTreinos || []; // remove o filtro que excluía idPersonal
  },

  // Treinos atribuídos pelo personal
  listarPersonal: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario.tipo !== "personal") return [];
    const { data } = await api.get(`/treinos/personal/${usuario.id}`);
    // agora só pega os treinos que têm idPersonal
    return (data.treinosAtribuidos || []).filter((t) => t.idPersonal);
  },
  
  listarAtribuidos: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario.tipo !== "personal") return [];
    
    try {
      console.log("Buscando treinos atribuídos para personal:", usuario.id);
      const { data } = await api.get(`/treinos/personal/${usuario.id}/atribuidos`);
      console.log("Treinos atribuídos retornados:", data);
      
      // ✅ GARANTIR que sempre retorne um array
      return Array.isArray(data.treinosAtribuidos) ? data.treinosAtribuidos : [];
    } catch (err) {
      console.error("Erro ao buscar treinos atribuídos:", err);
      return []; // ✅ Sempre retornar array vazio em caso de erro
    }
  },

  // Desatribuir treino
  desatribuir: async (idTreino) => {
      try {
          const { data } = await api.delete(`/treinos/atribuido/${idTreino}/desatribuir`);
          return data;
      } catch (err) {
          console.error("Erro ao desatribuir treino:", err);
          throw err;
      }
  },

  // Buscar treino completo
  buscarCompleto: async (idTreino) => {
    const { data } = await api.get(`/treinos/buscarCompleto/${idTreino}`);
    return data;
  },

  listarTreinosPersonalDoAluno: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario.tipo !== "aluno") return [];
    const { data } = await api.get(`/treinos/aluno/personal/${usuario.id}`);
    return data.treinosAtribuidos || [];
  },

  getHistoricoTreinos: async (dias = 30) => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const { data } = await api.get(`/treinos/historico?dias=${dias}`);
      return data;  // Retorna { success: true, treinos: [...] }
    } catch (err) {
      console.error("Erro ao obter histórico de treinos:", err);
      throw err;
    }
  },
  // Nova função: Criar sessão de treino (POST /treinos/criar-sessao)
  criarSessao: async (idTreino) => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const { data } = await api.post("/treinos/criar-sessao", {
        idTreino: idTreino,
        idUsuario: usuario.id,
        tipo_usuario: usuario.tipo,  // 'aluno' ou 'personal'
      });
      return data;  // Retorna { success: true, idSessao: ... }
    } catch (err) {
      console.error("Erro ao criar sessão:", err);
      throw err;
    }
  },
  // Nova função: Finalizar sessão de treino (POST /treinos/finalizar-sessao/{idSessao})
  finalizarSessao: async (idSessao, progresso, duracao, notas = null) => {
    try {
      const { data } = await api.post(`/treinos/finalizar-sessao/${idSessao}`, {
        progresso: progresso,  // Array ou objeto de progresso
        duracao: duracao,  // Tempo total em segundos
        notas: notas,  // Opcional
      });
      return data;  // Retorna { success: true }
    } catch (err) {
      console.error("Erro ao finalizar sessão:", err);
      throw err;
    }
  },
  // Nova função: Obter sessão para retomar (GET /treinos/retomar-sessao/{idSessao})
  getSessaoParaRetomar: async (idSessao) => {
    try {
      const { data } = await api.get(`/treinos/retomar-sessao/${idSessao}`);
      return data;  // Retorna { success: true, sessao: { ... } }
    } catch (err) {
      console.error("Erro ao obter sessão para retomar:", err);
      throw err;
    }
  },
  
};

export default treinosService;
