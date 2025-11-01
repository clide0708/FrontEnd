import { useState, useEffect } from "react";
import { loginUsuario } from "../../services/Auth/login";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Dumbbell, User, Users, Activity, Loader2 } from "lucide-react";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentUserType, setCurrentUserType] = useState(0);

  const userTypes = [
    { icon: Dumbbell, label: "Aluno", color: "#368DD9" },
    { icon: User, label: "Personal", color: "#4CAF50" },
    { icon: Users, label: "Academia", color: "#FF6B35" }
  ];

  // Verificar se há mensagem de sucesso do cadastro
  const successMessage = location.state?.message;

  // Animação cíclica dos tipos de usuário
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUserType((prev) => (prev + 1) % userTypes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      setError("Preencha email e senha");
      animateError();
      return;
    }

    setLoading(true);
    setError("");
    setIsAnimating(true);

    const result = await loginUsuario(email, senha, lembrar);

    if (result.success) {
      // Animação de sucesso antes do redirecionamento
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = "/home";
    } else {
      setError(result.error);
      animateError();
    }
    
    setLoading(false);
    setIsAnimating(false);
  };

  const animateError = () => {
    const container = document.querySelector('.login-container-global');
    container.classList.add('shake-animation');
    setTimeout(() => {
      container.classList.remove('shake-animation');
    }, 500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Função para limpar o erro quando o usuário começar a digitar
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (e) => {
    setSenha(e.target.value);
    if (error) {
      setError("");
    }
  };

  const CurrentIcon = userTypes[currentUserType].icon;

  return (
    <div className="loginCC">
      {/* Background animado */}
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="topppp-global">
        <div className="logo-container">
          <h2>CLIDE Fit</h2>
        </div>
      </div>

      <div className={`login-container-global ${isAnimating ? 'pulse-animation' : ''}`}>
        <div className="login-header">
          <h2 className="login-title-global">Bem-vindo de volta!</h2>
          <p className="login-subtitle">Entre na sua conta para continuar</p>
        </div>

        {successMessage && (
          <div className="login-success-message slide-in">
            {successMessage}
          </div>
        )}

        <div className="input-group-animated">
          <input
            className="login-input-global input-animated"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            placeholder="Email"
            type="email"
          />
          <div className="input-focus-border"></div>
        </div>

        <div className="input-group-animated">
          <div className="password-input-container">
            <input
              className="login-input-global password-input input-animated"
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder="Senha"
            />
            <button
              type="button"
              className="password-toggle animated-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="input-focus-border"></div>
        </div>

        <div className="login-options">
          <label className="login-checkbox-label animated-checkbox">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            <span className="checkmark"></span>
            Lembrar de mim
          </label>
        </div>

        {error && (
          <div className="login-error-global slide-in error-persistent">
            {error}
          </div>
        )}

        <button 
          className={`entrar login-button-global ${loading ? 'loading' : ''}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="spinner" size={20} />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>

        <div className="login-links-container">
          <button
            className="login-link-button-global link-animated"
            onClick={() => navigate("/cadastro")}
          >
            Não tem conta? <span> Cadastre-se</span>
          </button>

          <button
            className="login-link-button-global link-animated"
            onClick={() => navigate("/recuperar-senha")}
          >
            Esqueceu a senha? <span> Recuperar</span>
          </button>
          
          <button
            className="login-link-button-global link-animated"
            onClick={() => navigate("/home")}
          >
            <span>Voltar para início</span>
          </button>
        </div>
      </div>
    </div>
  );
}