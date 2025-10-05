import api from "../api";

const convitesService = {
  getConvitesByEmail: async (email) => {
    try {
      const res = await api.get(`/convites/${email}`);
      return res.data.success ? res.data.data : [];
    } catch (err) {
      console.error("Erro ao carregar convites:", err);
      return [];
    }
  },

  aceitarConvite: async (idConvite) => {
    try {
      const res = await api.post(`/convites/${idConvite}/aceitar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
      return { success: false, error: err.message };
    }
  },

  negarConvite: async (idConvite) => {
    try {
      const res = await api.post(`/convites/${idConvite}/negar`);
      return res.data;
    } catch (err) {
      console.error("Erro ao negar convite:", err);
      return { success: false, error: err.message };
    }
  },
};

export default convitesService;
