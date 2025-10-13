import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import banner from "./banner.jpg";
import "./style.css";

function Home() {
  const [frase, setFrase] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Função para buscar a frase motivacional
  const fetchFrase = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://cors-anywhere.herokuapp.com/https://allugofrases.herokuapp.com/frases/random"
      );

      // API retorna um objeto com content e meaning
      const data = Array.isArray(response.data) ? response.data[0] : response.data;

      setFrase({
        content: data.content || "Mantenha-se firme e continue tentando!",
        meaning: data.meaning || "CLIDE Fit",
      });
    } catch (err) {
      console.error("Erro ao buscar frase motivacional:", err.message);
      setFrase({
        content: "Mantenha-se firme e continue tentando!",
        meaning: "CLIDE Fit",
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
                <h6>Bem vindo novamente ao CLIDE Fit</h6>
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

        {/* Frase Motivacional */}
        <div className="gaming-library">
          <div className="heading-section">
            <h4>Frase do Dia</h4>
            {loading ? (
              <p>Carregando frase motivacional...</p>
            ) : (
              <div className="frase-motivacional">
                <blockquote>“{frase.content}”</blockquote>
                <p>{frase.meaning}</p>
                <button className="btn-refresh" onClick={fetchFrase}>
                  Outra frase
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <p>
                Copyright © 2025 <a href="#">CLIDE Fit</a> Todos os direitos
                reservados.
                <br />
                Design:{" "}
                <a
                  href="https://templatemo.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  TemplateMo
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
