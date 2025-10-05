// LandingPage.jsx
import "./style.css";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="lp-header">
        <div className="logo">ClideFit</div>
        <nav>
          <button onClick={() => navigate("/login")}>Entrar</button>
          <button onClick={() => navigate("/cadastro")} className="secondary">
            Cadastrar
          </button>
        </nav>
      </header>

      <section className="lp-hero">
        <div className="hero-content">
          <h1>Treinos acessíveis para todos</h1>
          <p>Transforme sua rotina com treinos adaptados ao seu ritmo e realidade.</p>
          <button onClick={() => navigate("/cadastro")}>Comece agora</button>
        </div>
      </section>

      <section className="lp-sobre">
        <h2>Sobre Nós</h2>
        <p>
          A ClideFit nasceu com o propósito de tornar o bem-estar acessível.
          Nossa missão é oferecer treinos inclusivos e personalizados, com tecnologia e cuidado humano.
        </p>
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
            <p>Interface intuitiva, ideal para todos os perfis e necessidades.</p>
          </div>
        </div>
      </section>

      <section className="lp-acessibilidade">
        <h2>Inclusão e Acessibilidade</h2>
        <p>
          Desenvolvemos treinos pensando em diferentes corpos e habilidades.
          Acreditamos que o movimento é para todos.
        </p>
      </section>

      <footer className="lp-footer">
        <p>© 2025 ClideFit. Todos os direitos reservados.</p>
        <div className="socials">
          <a href="#">Instagram</a>
          <a href="#">YouTube</a>
          <a href="#">Contato</a>
        </div>
      </footer>
    </div>
  );
}
