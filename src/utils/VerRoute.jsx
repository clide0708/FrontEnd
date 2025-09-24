import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";

export const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAutenticado(false);
      setLoading(false);
      return;
    }

    api.get("/auth/verificar-token", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (res.data.success) {
          setAutenticado(true);
        } else {
          // só remove token se o backend disse que ele é inválido
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          setAutenticado(false);
        }
      })
      .catch(err => {
        console.error("Erro ao verificar token:", err);
        // não remove token aqui, mantém para tentar de novo depois
        setAutenticado(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;

  return autenticado ? <Outlet /> : <Navigate to="/" />;
};

export const PublicRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/home" /> : <Outlet />;
};
