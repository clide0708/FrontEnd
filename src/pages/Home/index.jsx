import { useState, useEffect } from "react";
import bannerDesktop from "./banner.jpg";
import bannerMobile from "./banner-mobile.jpg";
import "./style.css";

function Home() {
  const [bannerImage, setBannerImage] = useState(bannerDesktop);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setBannerImage(bannerMobile);
      } else {
        setBannerImage(bannerDesktop);
      }
    };

    handleResize(); // chama ao carregar
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="page-content">
              {/* ***** Banner Start ***** */}
              <div
                className="main-banner"
                style={{
                  backgroundImage: `url(${bannerImage})`,
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
                      <h6>Seja bem vindo(a) CLIDE Fit</h6>
                      <h4>
                        <em>Treinos</em> personalizados, acessíveis e inclusivos
                      </h4>
                      <div className="main-button">
                        <a href="/treinos">Veja agora</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ***** Banner End ***** */}

              {/* ***** Treinos Grátis Start ***** */}
              <div className="gaming-library">
                <div className="heading-section">
                  <h4>Treinos acessíveis Grátis</h4>
                </div>
                {[
                  {
                    img: "musculacao.jpg",
                    title: "Musculação",
                    desc: "Costas e Biceps",
                    added: "24/08/2024",
                    duration: "1 H 22 Mins",
                    author: "Personal Fulano",
                  },
                  {
                    img: "crossfit.jpg",
                    title: "CrossFit",
                    desc: "Preparação para Jumping Pull-up",
                    added: "13/05/2024",
                    duration: "35 Mins",
                    author: "Personal Ciclano",
                  },
                  {
                    img: "yoga.jpg",
                    title: "Yoga",
                    desc: "Movimentos de alongamento",
                    added: "21/02/2025",
                    duration: "47 Mins",
                    author: "Personal Beltrano",
                  },
                ].map((treino, index) => (
                  <div className="item" key={index}>
                    <ul>
                      <li>
                        <img
                          src={`assets/images/${treino.img}`}
                          alt={treino.title}
                          className="templatemo-item"
                        />
                      </li>
                      <li>
                        <h4>{treino.title}</h4>
                        <span>{treino.desc}</span>
                      </li>
                      <li>
                        <h4>Adicionado em</h4>
                        <span>{treino.added}</span>
                      </li>
                      <li>
                        <h4>Duração</h4>
                        <span>{treino.duration}</span>
                      </li>
                      <li>
                        <h4>Criado por</h4>
                        <span>{treino.author}</span>
                      </li>
                      <li>
                        <div className="main-border-button">
                          <a href="#">Abrir</a>
                        </div>
                      </li>
                    </ul>
                  </div>
                ))}
                <div className="main-button">
                  <a href="/profile">Mais</a>
                </div>
              </div>
              {/* ***** Treinos Grátis End ***** */}
            </div>
          </div>
        </div>
      </div>

      {/* ***** Footer Start ***** */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <p className="footertext">
                Copyright © 2025 CLIDE Fit Todos os direitos
                reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
      {/* ***** Footer End ***** */}
    </div>
  );
}

export default Home;
