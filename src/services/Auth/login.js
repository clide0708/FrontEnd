import api from "../api";

export async function loginUsuario(email, senha, lembrar = false) {
  try {
    const response = await api.post("/auth/login", { 
      email, 
      senha, 
      lembrar 
    });

    const { success, token, usuario, error } = response.data;

    if (success && token) {
      // Salvar token e usuário
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      
      // Se lembrar está ativado, salvar email
      if (lembrar) {
        localStorage.setItem("lembrarLogin", "true");
        localStorage.setItem("emailLembrado", email);
      } else {
        // Limpar dados de lembrar login se não estiver marcado
        localStorage.removeItem("lembrarLogin");
        localStorage.removeItem("emailLembrado");
      }
      
      return { success: true, usuario, token };
    } else {
      return { success: false, error: error || "Credenciais inválidas" };
    }
  } catch (err) {
    console.error("Erro login:", err);
    
    // Tratamento mais específico de erros
    if (err.response && err.response.data) {
      return { 
        success: false, 
        error: err.response.data.error || "Erro ao fazer login" 
      };
    } else if (err.request) {
      return { 
        success: false, 
        error: "Erro de conexão. Verifique sua internet." 
      };
    } else {
      return { 
        success: false, 
        error: "Erro inesperado. Tente novamente." 
      };
    }
  }
}

export async function obterUsuario() {
  try {
    const response = await api.get("/auth/obter-usuario");
    return response.data.usuario;
  } catch (err) {
    console.error("Erro ao obter usuário:", err);
    
    // Se não conseguir obter usuário, limpar dados inválidos
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    
    throw err;
  }
}

export async function verificarToken() {
  try {
    const response = await api.get("/auth/verificar-token");
    return response.data;
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    throw err;
  }
}

export async function logoutUsuario() {
  try {
    const response = await api.post("/auth/logout");
    
    // Limpar dados locais independente da resposta do servidor
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("lembrarLogin");
    localStorage.removeItem("emailLembrado");
    
    return response.data;
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
    
    // Limpar dados locais mesmo com erro
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("lembrarLogin");
    localStorage.removeItem("emailLembrado");
    
    return { success: true, message: "Logout realizado localmente" };
  }
}

// Verificar se há dados de login salvos
export function getDadosLoginLembrado() {
  const lembrar = localStorage.getItem("lembrarLogin") === "true";
  const email = localStorage.getItem("emailLembrado") || "";
  
  return {
    lembrar,
    email
  };
}

// Verificar autenticação do usuário atual
export async function verificarAutenticacao() {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return { autenticado: false };
    }
    
    const response = await api.get("/auth/verificar-autenticacao");
    return { 
      autenticado: response.data.success,
      usuario: JSON.parse(localStorage.getItem("usuario") || "null")
    };
  } catch (err) {
    console.error("Erro ao verificar autenticação:", err);
    return { autenticado: false };
  }
}