import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes";

//puxa as rotas para o main

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoutes /> 
  </StrictMode>
);