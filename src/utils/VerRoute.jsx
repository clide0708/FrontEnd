import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";

// rota privada: só entra se estiver logado
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

    api
      .get("/auth/verificar-token", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        if (res.data.success) {
          setAutenticado(true);
        } else {
          // token inválido → limpa storage
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          setAutenticado(false);
        }
      })
      .catch((err) => {
        console.error("Erro ao verificar token:", err);
        setAutenticado(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;

  return autenticado ? <Outlet /> : <Navigate to="/" />;
};

// rota pública
export const PublicRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/home" /> : <Outlet />;
};

// rota com role
export const RoleRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!token || !usuario) {
    return <Navigate to="/" />;
  }

  // checa pelo campo "tipo" que vem do backend
  if (!allowedRoles.includes(usuario.tipo)) {
    return <Navigate to="/home" />;
  }

  return <Outlet />;
};
