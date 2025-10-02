import api from "../api";

const treinosService = {
  // Criar treino
  criar: async (treino) => {
    const { data } = await api.post("/treinos/criar", treino);
    // se o backend não retorna idTreino ou tipo, força defaults
    return {
      idTreino: data.idTreino,
      nome: data.nome || treino.nome,
      descricao: data.descricao || treino.descricao,
      tipo: data.tipo || treino.tipo,
      criadoPor: data.criadoPor || treino.criadoPor,
      exercicios: data.exercicios || [],
      idAluno: data.idAluno || treino.idAluno || null,
      idPersonal: data.idPersonal || treino.idPersonal || null,
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
    };
  },

  // Deletar treino
  deletar: async (idTreino) => {
    const { data } = await api.delete(`/treinos/excluir/${idTreino}`);
    return data;
  },

  // Listar treinos do usuário logado (backend decide se é aluno/personal)
  listarUsuario: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const { data } = await api.post("/treinos/listarUsuario", {
      idUsuario: usuario.id,
    });
    return data || [];
  },

  // Listar só os treinos "Meus Treinos" (aluno: sem personal)
  listarMeus: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario.tipo === "aluno") {
      const { data } = await api.get(`/treinos/aluno/${usuario.id}`);
      return (data.meusTreinos || []).filter((t) => !t.idPersonal);
    }
    if (usuario.tipo === "personal") {
      const { data } = await api.get(
        `/treinos/personal/${usuario.id}/meus-treinos`
      );
      return (data.meusTreinos || []).filter((t) => !t.idPersonal);
    }
    return [];
  },

  // Listar treinos de personal atribuídos a alunos (só com idPersonal)
  listarPersonal: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario.tipo === "personal") {
      const { data } = await api.get(`/treinos/personal/${usuario.id}`);
      return data.treinosAtribuidos || [];
    }
    return [];
  },

  // Buscar treino completo (com exercícios e vídeos)
  buscarCompleto: async (idTreino) => {
    const { data } = await api.get(`/treinos/buscarCompleto/${idTreino}`);
    return data;
  },
};

export default treinosService;
