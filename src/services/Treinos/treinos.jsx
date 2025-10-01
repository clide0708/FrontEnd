import api from "../api";

const treinosService = {
  // lista treinos do usuário logado (aluno ou personal)
  listarMeus: async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) throw new Error("Usuário não logado");

    const response = await api.post("/treinos/listarUsuario", {
      tipo: usuario.tipo,
      id: usuario.id,
      email: usuario.email,
    });

    if (response.data.success) {
      return response.data.treinos;
    } else {
      throw new Error(response.data.error || "Erro ao listar treinos");
    }
  },

  criar: async (treino) => {
    const payload = { ...treino };

    // não envia exercicios se vazio
    if (!payload.exercicios || payload.exercicios.length === 0) {
      delete payload.exercicios;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario.tipo === "aluno") payload.idPersonal = null;
    if (usuario.tipo === "personal") payload.idAluno = treino.idAluno || null;

    const res = await api.post("/treinos/criar", payload);
    if (res.data.success) return res.data.idTreino;
    throw new Error(res.data.error || "Erro ao criar treino");
  },

  editar: async (treino) => {
    const res = await api.put(`/treinos/editar/${treino.id}`, treino);
    if (res.data.success) return res.data.treino;
    throw new Error(res.data.error || "Erro ao editar treino");
  },

  deletar: async (id) => {
    const res = await api.delete(`/treinos/deletar/${id}`);
    if (res.data.success) return true;
    throw new Error(res.data.error || "Erro ao deletar treino");
  },
};

export default treinosService;
