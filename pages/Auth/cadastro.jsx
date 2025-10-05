import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importe sua função de serviço real, ex.: import { cadastroUsuario } from "../../services/Auth/cadastro";
import "./cadastro.css"; // Importa o arquivo CSS

export default function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCadastro = async () => {
    // Validação básica
    if (!nome || !email || !senha || !confirmarSenha) {
      setError("Todos os campos são obrigatórios!");
      return;
    }
    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }
    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    // Chame sua função de serviço real aqui
    // const result = await cadastroUsuario(nome, email, senha);
    // if (result.success) {
    //   setSuccess("Cadastro realizado com sucesso! Redirecionando para login...");
    //   setTimeout(() => navigate("/login"), 2000);
    // } else {
    //   setError(result.error);
    // }

    // Placeholder para teste
    setSuccess("Cadastro realizado com sucesso! Redirecionando para login...");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro</h2>
      <input
        className="cadastro-input"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome Completo"
        type="text"
      />
      <input
        className="cadastro-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <input
        className="cadastro-input"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha"
      />
      <input
        className="cadastro-input"
        type="password"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
        placeholder="Confirmar Senha"
      />
      <button className="cadastro-button" onClick={handleCadastro}>
        Cadastrar
      </button>
      <button className="cadastro-link-button" onClick={() => navigate("/login")}>
        Já tenho conta - Voltar para Login
      </button>
      {error && <p className="cadastro-error">{error}</p>}
      {success && <p className="cadastro-success">{success}</p>}
    </div>
  );
}