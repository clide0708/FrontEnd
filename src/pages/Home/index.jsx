import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import banner from "./banner.jpg";
import "./style.css";

function Home() {
  const [frase, setFrase] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Função para buscar ditado da API
  const fetchFrase = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ditado-api.fly.dev/ditados/random"
      );
      setFrase({
        content: response.data.content,
        meaning: response.data.meaning,
      });
    } catch (err) {
      console.error("Erro ao buscar ditado:", err.message);
      setFrase({
        content: "Mantenha-se firme e continue tentando!",
        meaning: "ClideFit",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrase();
  }, []);

  return (
    <div className="home">
      <div className="container">
        {/* Banner */}
        <div
          className="main-banner"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: "100px 0",
            color: "white",
          }}
        >
          <div className="row">
            <div className="col-lg-7">
              <div className="header-text">
                <h6>Bem-vindo novamente ao ClideFit</h6>
                <h4>Vamos começar?</h4>
                <div className="main-button">
                  <Link
                    to="/treinos"
                    className={
                      location.pathname === "/treinos" ||
                      location.pathname === "/treinando"
                        ? "active"
                        : ""
                    }
                  >
                    Bora Treinar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ditado Popular */}
        <div className="motivacional-section">
          {loading ? (
            <p>Carregando ditado...</p>
          ) : (
            <div className="frase-motivacional">
              <blockquote>“{frase.content}”</blockquote>
              <p>{frase.meaning}</p>
            </div>
          )}
        </div>
      </div>

      <div className="novidades">
        <h4>Novidades</h4>
        <div className="novidades-lista">
          <div className="novidade-item">
            <h5>Novo treino de pernas disponível!</h5>
            <p>Confira a nova rotina intensa focada em quadríceps e glúteos.</p>
          </div>

          <div
            className="novidade-item"
            onClick={() =>
              window.open(
                "https://open.spotify.com/playlist/7uJiRvoz3rha3X1Neqi3po?si=8adb98b263b14e8f",
                "_blank"
              )
            }
            style={{ cursor: "pointer" }}
          >
            <h5>Playlist motivacional</h5>
            <p>Nova playlist no Spotify com músicas pra te manter no ritmo!</p>
          </div>

          <div className="novidade-item">
            <h5>Desafios semanais atualizados</h5>
            <p>
              Ganhe pontos extras ao completar todos os desafios desta semana.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>
            Copyright © 2025<a href="#"> ClideFit</a> - Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
