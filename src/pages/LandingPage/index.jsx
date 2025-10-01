// LandingPage.jsx
import "./style.css";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <section className="lp-hero">
        <h1>ClideFit</h1>
        <p>A sua plataforma de Treinos</p>
        <button onClick={() => navigate("/login")}>Entrar</button>
      </section>

      <section className="lp-sobre">
        <h2>Sobre Nós</h2>
        <p>
          Somos uma equipe dedicada a entregar soluções incríveis para nossos clientes.
        </p>
      </section>

      <section className="lp-servicos">
        <h2>Nossos Serviços</h2>
        <div className="cards">
          <div className="card">
            <h3>Treinamentos</h3>
            <p>Aprenda com os melhores profissionais do mercado.</p>
          </div>
          <div className="card">
            <h3>Consultoria</h3>
            <p>Estratégias personalizadas pro seu crescimento.</p>
          </div>
          <div className="card">
            <h3>Suporte 24/7</h3>
            <p>Estamos sempre disponíveis quando você precisa.</p>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <p>© 2025 MinhaMarca. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
