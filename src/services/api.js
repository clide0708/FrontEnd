import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // pega do .env
  headers: { "Content-Type": "application/json" },
});

// interceptador pra injetar token em cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
