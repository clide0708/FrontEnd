import { useState } from "react";
import { loginUsuario } from "../../services/Auth/login";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./style.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verificar se há mensagem de sucesso do cadastro
  const successMessage = location.state?.message;

  const handleLogin = async () => {
    if (!email || !senha) {
      setError("Preencha email e senha");
      return;
    }

    setLoading(true);
    setError("");

    const result = await loginUsuario(email, senha, lembrar);

    if (result.success) {
      window.location.href = "/home";
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="loginCC">
      <div className="topppp-global">
        <h2>ClideFit</h2>
      </div>
      <div className="login-container-global">
        <h2 className="login-title-global">Login</h2>

        {successMessage && (
          <div className="login-success-message">
            {successMessage}
          </div>
        )}

        <input
          className="login-input-global"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Email"
          type="email"
        />

        <div className="password-input-container">
          <input
            className="login-input-global password-input"
            type={showPassword ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Senha"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="login-options">
          <label className="login-checkbox-label">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            Lembrar de mim
          </label>
        </div>

        {error && <p className="login-error-global">{error}</p>}

        <button 
          className="login-button-global" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
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
        
        <button
          className="login-link-button-global"
          onClick={() => navigate("/home")}
        >
          Voltar para início
        </button>
      </div>
    </div>
  );
}