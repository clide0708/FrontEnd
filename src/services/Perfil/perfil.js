import api from "../api";

const perfilService = {
  // Buscar perfil completo por email
  getPerfil: async (email) => {
    try {
      console.log("📧 Buscando perfil por email:", email);
      const response = await api.get(`/perfil/${encodeURIComponent(email)}`);
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      return {
        success: false,
        error: err.response?.data?.error || 'Erro ao buscar perfil'
      };
    }
  },

  // Buscar perfil por ID e tipo
  getPerfilCompleto: async (idUsuario, tipoUsuario) => {
    try {
      console.log("🔍 Buscando perfil completo:", { idUsuario, tipoUsuario });
      
      if (!idUsuario || idUsuario === 'undefined') {
        console.error("❌ ID do usuário é undefined");
        return null;
      }

      const response = await api.get(`/perfil/completo/${tipoUsuario}/${idUsuario}`);
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar perfil completo:", err);
      return null;
    }
  },

  // Atualizar perfil
  atualizarPerfil: async (data) => {
    try {
      const response = await api.put(`/perfil/atualizar`, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  },

  // Upload de foto de perfil
  uploadFotoPerfil: async (formData) => {
    try {
      const response = await api.put(`/perfil/foto`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      console.error("Erro ao fazer upload da foto:", err);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  },

  // Deletar foto de perfil
  deletarFotoPerfil: async (nomeArquivo) => {
    try {
      console.log("🗑️ Deletando foto:", nomeArquivo);
      const response = await api.delete(`/upload/deletar-foto`, {
        data: { nome_arquivo: nomeArquivo }
      });
      return response.data;
    } catch (err) {
      console.error("Erro ao deletar foto:", err);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  },

  // Buscar modalidades
  getModalidades: async () => {
    try {
      const response = await api.get("/cadastro/modalidades");
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar modalidades:", err);
      return { success: false, data: [] };
    }
  },

  // Buscar academias ativas
  getAcademiasAtivas: async () => {
    try {
      const response = await api.get("/academias-ativas");
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar academias:", err);
      return { success: false, data: [] };
    }
  },

  // Buscar endereço por email
  getEndereco: async (email) => {
    try {
      const response = await api.get(`/endereco/${email}`);
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar endereço:", err);
      return null;
    }
  },

  // Atualizar endereço
  atualizarEndereco: async (data) => {
    try {
      const response = await api.put("/endereco/atualizar", data);
      return response.data;
    } catch (err) {
      console.error("Erro ao atualizar endereço:", err);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  },

  getPersonalPorId: async (id) => {
    try {
      const response = await api.get(`/perfil/personalNM/${id}`);
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar personal:", err.response?.data || err.message);
      return null;
    }
  },

  
};

export default perfilService;