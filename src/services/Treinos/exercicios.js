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
    return Array.isArray(res.data?.exercicios) ? res.data.exercicios : [];
  } catch (err) {
    console.error(`Erro ao buscar exercícios do treino ${idTreino}:`, err);
    return [];
  }
};

// adicionar exercício ao treino - AGORA SIMPLIFICADO
const adicionarExercicioAoTreino = async (idTreino, exercicio) => {
  try {
    console.log("Exercício para adicionar:", exercicio);

    const payload = {
      idExercicio: exercicio.idExercicio || exercicio.id, // APENAS idExercicio
      series: exercicio.series || 3,
      repeticoes: exercicio.repeticoes || 10,
      carga: exercicio.carga || 0,
      descanso: exercicio.descanso || 0,
      ordem: exercicio.ordem || 0,
      observacoes: exercicio.informacoes || "",
    };

    console.log("Payload enviado para API:", payload);

    const res = await api.post(
      `/treinos/${idTreino}/adicionar-exercicio`,
      payload
    );
    
    console.log("Resposta da API ao adicionar:", res.data);
    return res.data;
  } catch (err) {
    console.error(`Erro ao adicionar exercício ao treino ${idTreino}:`, err);
    return { success: false, error: err.message };
  }
};

// atualizar exercício dentro do treino
const atualizarExercicioNoTreino = async (idExercicio, data) => {
  try {
    const cargaNumerica = data.carga !== "" ? Number(data.carga) : 0;
    
    const res = await api.put(
      `/treinos/exercicio/${idExercicio}/atualizar`,
      {
        series: data.series,
        repeticoes: data.repeticoes,
        carga: cargaNumerica,
        descanso: data.descanso,
        ordem: data.ordem || 0,
      }
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

const buscarExerciciosGlobaisPorTipo = async (tipo) => {
  try {
    const res = await api.get(`/exercicios/por-tipo/${tipo}`);
    return res.data || [];
  } catch (err) {
    console.error(`Erro ao buscar exercícios globais do tipo ${tipo}:`, err);
    return [];
  }
};

const buscarTodosExerciciosComFiltro = async (tipoFiltro = null) => {
  try {
    const res = await api.get(`/exercicios/buscarTodos`);
    let exercicios = res.data || [];
    
    // Aplicar filtro se especificado
    if (tipoFiltro) {
      exercicios = exercicios.filter(ex => ex.tipo_exercicio === tipoFiltro);
    }
    
    return exercicios;
  } catch (err) {
    console.error("Erro ao buscar exercícios com filtro:", err);
    return [];
  }
};

export default {
  buscarTodosExercicios,
  buscarExerciciosDoTreino,
  buscarExerciciosGlobaisPorTipo,
  buscarTodosExerciciosComFiltro,
  adicionarExercicioAoTreino,
  atualizarExercicioNoTreino,
  removerExercicioDoTreino,
};