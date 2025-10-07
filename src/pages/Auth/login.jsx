import { useState } from "react";
import { loginUsuario } from "../../services/Auth/login";
import { useNavigate } from "react-router-dom";
import "./style.css";

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
    <div className="loginCC">
      <div className="topppp-global">
        <h2>ClideFit</h2>
      </div>
      <div className="login-container-global">
        <h2 className="login-title-global">Login</h2>

        <input
          className="login-input-global"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          className="login-input-global"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
        />

        {error && <p className="login-error-global">{error}</p>}

        <button className="login-button-global" onClick={handleLogin}>
          Entrar
        </button>

        <button
          className="login-link-button-global"
          onClick={() => navigate("/cadastro")}
        >
          Cadastro
        </button>

        <button
          className="login-link-button-global"
          onClick={() => navigate("/recuperar-senha")}
        >
          Recuperar Senha
        </button>
      </div>
    </div>
  );
}