import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 
    "Content-Type": "application/json",
  },
  withCredentials: true, // IMPORTANTE: envia cookies/token entre domínios
  timeout: 30000, // Aumenta timeout para APIs externas
});

// Interceptor para injetar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.withCredentials = true; // Apenas para requests autenticadas
  
  // Log para debug (remova em produção)
  console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  
  return config;
});

// Interceptor para tratamento global de erros
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
      // Token expirado - redireciona para login
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("lembrarLogin");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;