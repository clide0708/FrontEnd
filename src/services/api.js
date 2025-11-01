import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 
    "Content-Type": "application/json",
  },
  // REMOVA withCredentials da configuração global
  timeout: 30000,
});

// Interceptor para injetar token APENAS para rotas autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  // Apenas rotas autenticadas precisam de credentials
  const publicRoutes = [
    '/auth/login',
    '/cadastro/',
    '/recuperacao-senha/',
    '/config/'
  ];
  
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
  
  if (!isPublicRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.withCredentials = true; // Apenas para rotas autenticadas
  }
  
  console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor de resposta mantém o mesmo
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("lembrarLogin");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;