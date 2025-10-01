import { useNavigate } from "react-router-dom";

export default function CadastroPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Cadastro</h1>
      <button onClick={() => navigate("/login")}>Entrar</button>
    </div>
  );
}
