import { useState } from "react";
import { useNavigate } from "react-router-dom";
import recuperarSenhaService from "../../services/Auth/recuperar";
import "./style.css";

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagemModal, setMensagemModal] = useState(""); // <- nova mensagem só pro modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnviarEmail = async (e) => {
  e.preventDefault();
  if (!email) return setMensagem("Digite seu email:");

  setLoading(true);
  try {
    await recuperarSenhaService.esqueciSenha(email);
    
    // Mensagem mais informativa para desenvolvimento
    if (window.location.hostname === 'localhost') {
      setMensagem("✅ Código gerado! Verifique o console do backend ou arquivo de logs.");
    } else {
      setMensagem(" ✅ Código enviado para seu email!");
    }
    
    setMostrarModal(true);
  } catch (err) {
    console.error(err);
    if (err.response?.data?.error) {
      setMensagem(`erro: ${err.response.data.error}`);
    } else {
      setMensagem("Erro ao enviar código, verifique as informações e tenta novamente.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleResetSenha = async (e) => {
    e.preventDefault();

    if (!email || !codigo || !novaSenha) {
      setMensagemModal("Preencha todos os campos!"); // <- só pro modal
      return;
    }

    if (codigo.length !== 6) {
      setMensagemModal("O código deve ter 6 dígitos 😅!"); // <- só pro modal
      return;
    }

    try {
      await recuperarSenhaService.resetarSenha(email, codigo, novaSenha);
      setMensagem("Senha resetada com sucesso 🔥!");
      setMensagemModal(""); // limpa a mensagem do modal

      setTimeout(() => {
        setMostrarModal(false);
        setEmail("");
        setCodigo("");
        setNovaSenha("");
        navigate("/login");
      }, 1000);
    } catch (err) {
      if (err.response) {
        console.log("Erro no servidro:", err.response.data);
        setMensagemModal(`erro: ${err.response.status} - ${err.response.data}`);
      } else {
        console.log(err);
        setMensagemModal("Erro de conexão 😓");
      }
    }
  };

  const handleCodigoChange = (e) => {
    let val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setCodigo(val);
  };

  return (
    <div className="recuperarCC">
      <div className="cntrcds">
        <div className="topppp-global">
          <h2>CLIDE Fit</h2>
        </div>
        <div className="rs-container-main">
          <h2 className="rs-title">Esqueci minha senha</h2>
          <form className="rs-form-email" onSubmit={handleEnviarEmail}>
            <input
              className="rs-input-email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="rs-btn-enviar" type="submit" disabled={loading}>
              {loading ? (
                <span className="rs-loading">⏳</span>
              ) : (
                "Enviar código"
              )}
            </button>
          </form>
          <button
            className="login-link-button-global"
            onClick={() => navigate("/login")}
          >
            Lembrei da senha
          </button>
          <button
            className="cad-link-button"
             onClick={() => navigate("/home")}
            >
             Voltar para início
          </button>

          {mensagem && <p className="rs-msg">{mensagem}</p>}

          {mostrarModal && (
            <div className="rs-modal-overlay">
              <div className="rs-modal-box">
                <h3 className="rs-modal-title">Insira o código</h3>
                {mensagemModal && (
                  <p className="rs-msg">{mensagemModal}</p>
                )}{" "}
                {/* <- mensagem só do modal */}
                <form
                  className="rs-form-codigo"
                  onSubmit={handleResetSenha}
                  autoComplete="off"
                >
                  <input type="text" style={{ display: "none" }} />
                  <input type="password" style={{ display: "none" }} />

                  <input
                    className="rs-input-codigo"
                    type="text"
                    placeholder="Código"
                    value={codigo}
                    onChange={handleCodigoChange}
                    autoComplete="off"
                    name="codigo_reset_123"
                  />
                  <input
                    className="rs-input-nova-senha"
                    type="password"
                    placeholder="Nova senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    autoComplete="new-password"
                    name="nova_senha_456"
                  />
                  <button className="rs-btn-reset" type="submit">
                    Resetar senha
                  </button>
                </form>
                <button
                  className="rs-btn-fechar"
                  onClick={() => setMostrarModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
