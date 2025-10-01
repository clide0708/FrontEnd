import { useState } from "react";
import { loginUsuario } from "../../services/Auth/login";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const result = await loginUsuario(email, senha);

    if (result.success) {
      // token e usuário já estão salvos no localStorage dentro de loginUsuario
      alert("Login feito com sucesso 😎");
      window.location.href = "/home"; // ou use navigate("/home") se estiver usando react-router
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha"
      />
      <button onClick={() => navigate("/cadastro")}>Cadastro</button>
      <button onClick={handleLogin}>Entrar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
