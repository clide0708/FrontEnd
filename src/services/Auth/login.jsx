import api from "../api";

export async function loginUsuario(email, senha) {
  try {
    const response = await api.post("/auth/login", { email, senha });
    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      return { success: true, usuario: response.data.usuario };
    } else {
      return { success: false, error: response.data.error || "Erro no login" };
    }
  } catch (err) {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}
