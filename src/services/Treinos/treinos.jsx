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
};

export default treinosService;
