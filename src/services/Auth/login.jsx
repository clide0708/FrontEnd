import api from "../api";

export async function loginUsuario(email, senha) {
  try {
    const response = await api.post("/auth/login", { email, senha });

    const { success, token, usuario, error } = response.data;

    if (success && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      return { success: true, usuario };
    } else {
      return { success: false, error: error || "Credenciais inválidas" };
    }
  } catch (err) {
    console.error("Erro login:", err);
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}
