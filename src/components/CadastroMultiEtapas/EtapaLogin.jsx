import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const EtapaLogin = ({ dados, onChange }) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erros, setErros] = useState({});

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarSenha = (senha) => {
    return senha.length >= 6;
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    onChange({ email });

    if (email && !validarEmail(email)) {
      setErros(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErros(prev => ({ ...prev, email: '' }));
    }
  };

  const handleSenhaChange = (e) => {
    const senha = e.target.value;
    onChange({ senha });

    if (senha && !validarSenha(senha)) {
      setErros(prev => ({ ...prev, senha: 'Senha deve ter pelo menos 6 caracteres' }));
    } else {
      setErros(prev => ({ ...prev, senha: '' }));
    }

    // Validar confirmação se já estiver preenchida
    if (dados.confirmarSenha && senha !== dados.confirmarSenha) {
      setErros(prev => ({ ...prev, confirmarSenha: 'Senhas não coincidem' }));
    } else {
      setErros(prev => ({ ...prev, confirmarSenha: '' }));
    }
  };

  const handleConfirmarSenhaChange = (e) => {
    const confirmarSenha = e.target.value;
    onChange({ confirmarSenha });

    if (confirmarSenha && confirmarSenha !== dados.senha) {
      setErros(prev => ({ ...prev, confirmarSenha: 'Senhas não coincidem' }));
    } else {
      setErros(prev => ({ ...prev, confirmarSenha: '' }));
    }
  };

  return (
    <div className="etapa-login">
      <h2>Dados de Login</h2>
      <p>Crie suas credenciais de acesso</p>

      <div className="form-grid">
        {/* Email */}
        <div className="input-group full-width">
          <label>
            <Mail size={16} />
            Email *
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={dados.email}
            onChange={handleEmailChange}
            required
          />
          {erros.email && <span className="erro">{erros.email}</span>}
        </div>

        {/* Senha */}
        <div className="input-group">
          <label>
            <Lock size={16} />
            Senha *
          </label>
          <div className="password-input-container">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={dados.senha}
              onChange={handleSenhaChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erros.senha && <span className="erro">{erros.senha}</span>}
        </div>

        {/* Confirmar Senha */}
        <div className="input-group">
          <label>Confirmar Senha *</label>
          <div className="password-input-container">
            <input
              type={mostrarConfirmarSenha ? "text" : "password"}
              placeholder="Digite novamente sua senha"
              value={dados.confirmarSenha}
              onChange={handleConfirmarSenhaChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            >
              {mostrarConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erros.confirmarSenha && <span className="erro">{erros.confirmarSenha}</span>}
        </div>
      </div>

      <div className="dicas-senha">
        <p><strong>Dicas para uma senha segura:</strong></p>
        <ul>
          <li>Mínimo de 6 caracteres</li>
          <li>Use letras maiúsculas e minúsculas</li>
          <li>Inclua números e símbolos</li>
          <li>Evite sequências óbvias</li>
        </ul>
      </div>
    </div>
  );
};

export default EtapaLogin;