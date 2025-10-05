import { useState } from "react";
import { loginUsuario } from "../../services/Auth/login";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Importa o arquivo CSS

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const result = await loginUsuario(email, senha);

    if (result.success) {
      alert("Login feito com sucesso 😎");
      window.location.href = "/home";
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        className="login-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <input
        className="login-input"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha"
      />
      <button className="login-button" onClick={handleLogin}>
        Entrar
      </button>
      <button className="login-link-button" onClick={() => navigate("/cadastro")}>
        Cadastro
      </button>
      <button className="login-link-button" onClick={() => navigate("/recuperar-senha")}>
        Recuperar Senha
      </button>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}