// src/services/Notification/convites.jsx
import api from "../api.js";

// Buscar convites por email do aluno
export const getConvitesByEmail = async (email) => {
  try {
    const response = await api.get(`/convites/email/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar convites:", error);
    throw error;
  }
};

// Aceitar convite
export const aceitarConvite = async (idConvite) => {
  try {
    const response = await api.post(`/convites/${idConvite}/aceitar`);
    return response.data;
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    throw error;
  }
};

// Negar convite
export const negarConvite = async (idConvite) => {
  try {
    const response = await api.post(`/convites/${idConvite}/negar`);
    return response.data;
  } catch (error) {
    console.error("Erro ao negar convite:", error);
    throw error;
  }
};

// Criar convite (para personais)
export const criarConvite = async (conviteData) => {
  try {
    const response = await api.post('/convites/criar', conviteData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar convite:", error);
    throw error;
  }
};