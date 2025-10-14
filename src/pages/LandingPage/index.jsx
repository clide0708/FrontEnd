// LandingPage.jsx
import "./style.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import banner from "./banner.jpg";

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div id="inicio" className="landingPage">
      <header className={`lp-header ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">ClideFit</div>
        <nav>
          <button onClick={() => navigate("/login")}>Entrar</button>
          <button onClick={() => navigate("/cadastro")} className="secondary">
            Cadastrar
          </button>
        </nav>
      </header>

      {/* banner vindo da pasta public */}
      <section className="lp-banner">
        <div
          className="main-banner"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
          }}
        >
          <div className="row">
            <div className="col-lg-7">
              <div className="header-text">
                <h4>ClideFit</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-hero">
        <div className="hero-content">
          <h1>Treinos acessíveis para todos</h1>
          <p>
            Transforme sua rotina com treinos adaptados ao seu ritmo e
            realidade.
          </p>
          <button onClick={() => navigate("/cadastro")}>Comece agora</button>
        </div>
      </section>

      <section id="planos" className="lp-planos">
        <h2>Nossos Planos</h2>
        <div className="planos-container">
          <div className="plano-card">
            <h3>Plano Aluno</h3>
            <ul>
              <li>✔️ Acesso a treinos personalizados</li>
              <li>✔️ Acompanhamento de desempenho</li>
              <li>✔️ Suporte online</li>
            </ul>
            <button onClick={() => navigate("/login")}>Assinar</button>
          </div>

          <div className="plano-card">
            <h3>Plano Personal</h3>
            <ul>
              <li>✔️ Criação de treinos para alunos</li>
              <li>✔️ Gerenciamento de planos</li>
              <li>✔️ Painel exclusivo</li>
            </ul>
            <button onClick={() => navigate("/login")}>Assinar</button>
          </div>

          <div className="plano-card">
            <h3>Academia Parceira</h3>
            <ul>
              <li>✔️ Integração com ClideFit</li>
              <li>✔️ Divulgação na plataforma</li>
              <li>✔️ Suporte dedicado</li>
            </ul>
            <button onClick={() => navigate("/login")}>Seja Parceira</button>
          </div>
        </div>
      </section>

      <section id="sobre" className="lp-sobre">
        <h2>Sobre Nós</h2>
        <p>
          A ClideFit nasceu com o propósito de tornar o bem-estar acessível.
          Nossa missão é oferecer treinos inclusivos e personalizados, com
          tecnologia e cuidado humano. Buscamos inspirar pessoas de todas as
          idades, corpos e realidades a se moverem e encontrarem equilíbrio.
          Nosso compromisso vai além da saúde física — acreditamos no impacto
          social e sustentável do movimento.
        </p>

        <div className="ods-container">
          <div className="ods-card">
            <h3>ODS 3 - Saúde e Bem-estar</h3>
            <p>
              Promover o bem-estar físico e mental através do acesso democrático
              a treinos e hábitos saudáveis.
            </p>
          </div>
          <div className="ods-card">
            <h3>ODS 10 - Redução das Desigualdades</h3>
            <p>
              Tornar o acesso à atividade física inclusivo para todos,
              valorizando a diversidade e acessibilidade.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-servicos">
        <h2>Nossos Serviços</h2>
        <div className="cards">
          <div className="card">
            <h3>Treinamentos Personalizados</h3>
            <p>Planos de treino adaptados ao seu corpo e objetivos.</p>
          </div>
          <div className="card">
            <h3>Consultoria e Acompanhamento</h3>
            <p>Suporte profissional para evoluir com segurança.</p>
          </div>
          <div className="card">
            <h3>Plataforma Acessível</h3>
            <p>
              Interface intuitiva, ideal para todos os perfis e necessidades.
            </p>
          </div>
        </div>
      </section>

      <footer id="contato" className="lp-footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3>ClideFit</h3>
            <p>
              Tornando o bem-estar acessível a todos. Junte-se a nós e
              transforme sua rotina de treinos.
            </p>
          </div>

          <div className="footer-center">
            <h4>Links Rápidos</h4>
            <ul>
              <li>
                <a href="#inicio">Início</a>
              </li>
              <li>
                <a href="#sobre">Sobre</a>
              </li>
              <li>
                <a href="#planos">Planos</a>
              </li>
              <li>
                <a href="#contato">Contato</a>
              </li>
            </ul>
          </div>

          <div className="footer-right">
            <h4>Redes Sociais</h4>
            <div className="socials">
              <a href="#">Instagram</a>
              <a href="#">YouTube</a>
            </div>
          </div>
        </div>
        <p className="footer-bottom">
          © 2025 ClideFit. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
