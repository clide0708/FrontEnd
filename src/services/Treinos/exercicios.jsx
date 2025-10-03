import api from "../api.js";

const buscarTodosExercicios = async () => {
  try {
    const res = await api.get(`/exercicios/buscarTodos`);
    return res.data || [];
  } catch (err) {
    console.error("Erro ao buscar todos exercícios:", err);
    return [];
  }
};

const buscarExerciciosDoTreino = async (idTreino) => {
  if (!idTreino) return [];
  try {
    const res = await api.get(`/treinos/${idTreino}/exercicios`);
    console.log("Resposta da API - Exercícios do treino:", res.data);

    // A API retorna { success: true, exercicios: [...] }
    return Array.isArray(res.data?.exercicios) ? res.data.exercicios : [];
  } catch (err) {
    console.error(`Erro ao buscar exercícios do treino ${idTreino}:`, err);
    return [];
  }
};

const buscarExercicioPorId = async (id) => {
  try {
    const res = await api.get(`/exercicios/buscarPorID?id=${id}`);
    return res.data || null;
  } catch (err) {
    console.error(`Erro ao buscar exercício ${id}:`, err);
    return null;
  }
};

const cadastrarExercicio = async (data) => {
  try {
    const res = await api.post(`/exercicios/cadastrar`, data);
    return res.data;
  } catch (err) {
    console.error("Erro ao cadastrar exercício:", err);
    return { success: false, error: err.message };
  }
};

const atualizarExercicio = async (id, data) => {
  try {
    const res = await api.put(`/exercicios/atualizar/${id}`, data);
    return res.data;
  } catch (err) {
    console.error(`Erro ao atualizar exercício ${id}:`, err);
    return { success: false, error: err.message };
  }
};

const deletarExercicio = async (id) => {
  try {
    const res = await api.delete(`/exercicios/deletar/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Erro ao deletar exercício ${id}:`, err);
    return { success: false, error: err.message };
  }
};

// adicionar exercício ao treino
const adicionarExercicioAoTreino = async (idTreino, exercicio) => {
  try {
    const res = await api.post(
      `/treinos/${idTreino}/adicionar-exercicio`,
      exercicio
    );
    return res.data;
  } catch (err) {
    console.error(`Erro ao adicionar exercício ao treino ${idTreino}:`, err);
    return { success: false, error: err.message };
  }
};

// atualizar exercício dentro do treino
const atualizarExercicioNoTreino = async (idExercicio, data) => {
  try {
    const res = await api.put(
      `/treinos/exercicio/${idExercicio}/atualizar`,
      data
    );
    return res.data;
  } catch (err) {
    console.error(`Erro ao atualizar exercício no treino ${idExercicio}:`, err);
    return { success: false, error: err.message };
  }
};

// remover exercício do treino
const removerExercicioDoTreino = async (idExercicio) => {
  try {
    const res = await api.delete(`/treinos/exercicio/${idExercicio}/remover`);
    return res.data;
  } catch (err) {
    console.error(`Erro ao remover exercício do treino ${idExercicio}:`, err);
    return { success: false, error: err.message };
  }
};

export default {
  buscarTodosExercicios,
  buscarExerciciosDoTreino,
  buscarExercicioPorId,
  cadastrarExercicio,
  atualizarExercicio,
  deletarExercicio,
  adicionarExercicioAoTreino,
  atualizarExercicioNoTreino,
  removerExercicioDoTreino,
};
