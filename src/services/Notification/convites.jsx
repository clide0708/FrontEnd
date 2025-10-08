// src/services/Notification/convites.jsx
import api from "../api.js";

// Funções individuais
export const getConvitesByEmail = async (email) => {
  try {
    const response = await api.get(`/convites/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar convites:", error);
    throw error;
  }
};

export const aceitarConvite = async (idConvite) => {
  try {
    const response = await api.post(`/convites/${idConvite}/aceitar`);
    return response.data;
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    throw error;
  }
};

export const negarConvite = async (idConvite) => {
  try {
    const response = await api.post(`/convites/${idConvite}/negar`);
    return response.data;
  } catch (error) {
    console.error("Erro ao negar convite:", error);
    throw error;
  }
};

export const criarConvite = async (conviteData) => {
  try {
    const response = await api.post('/convites/criar', conviteData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar convite:", error);
    throw error;
  }
};

// Exportação padrão como objeto de serviço
const convitesService = {
  getConvitesByEmail,
  aceitarConvite,
  negarConvite,
  criarConvite
};

export default convitesService;