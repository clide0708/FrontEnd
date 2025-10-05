import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importe sua função de serviço real, ex.: import { recuperarSenha } from "../../services/Auth/recuperar";
import "./recuperar-senha.css"; // Importa o arquivo CSS

export default function RecuperarSenhaPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRecuperar = async () => {
    // Validação básica
    if (!email) {
      setError("Por favor, insira seu email!");
      return;
    }

    // Chame sua função de serviço real aqui
    // const result = await recuperarSenha(email);
    // if (result.success) {
    //   setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");
    //   setTimeout(() => navigate("/login"), 3000);
    // } else {
    //   setError(result.error);
    // }

    // Placeholder para teste
    setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");
    setTimeout(() => navigate("/login"), 3000);
  };

  return (
    <div className="recuperar-container">
      <h2>Recuperar Senha</h2>
      <p>Digite seu email para receber instruções de recuperação.</p>
      <input
        className="recuperar-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <button className="recuperar-button" onClick={handleRecuperar}>
        Enviar Email de Recuperação
      </button>
      <button className="recuperar-link-button" onClick={() => navigate("/login")}>
        Voltar para Login
      </button>
      {error && <p className="recuperar-error">{error}</p>}
      {success && <p className="recuperar-success">{success}</p>}
    </div>
  );
}