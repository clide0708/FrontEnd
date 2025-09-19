//essa daqui é pra verificar se o cara está logado

import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  return false; //só pra teste
};

export const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};

export const PublicRoute = () => {
  return isAuthenticated() ? <Navigate to="/Home" /> : <Outlet />;
};