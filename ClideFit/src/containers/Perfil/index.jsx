// src/components/Profile.jsx
import "../../assets/css/style.css";
import "../../assets/css/templatemo-cyborg-gaming.css";

import "./style.css";

export default function Profile() {
  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="page-content">
            {/* ***** Banner Start ***** */}
            <div className="row">
              <div className="col-lg-12">
                <div className="main-profile">
                  <div className="row">
                    <div className="col-lg-4">
                      <img
                        src="assets/images/profilefoto.png"
                        alt="perfil"
                        style={{ borderRadius: "23px" }}
                      />
                    </div>
                    <div className="col-lg-4 align-self-center">
                      <div className="main-info header-text">
                        <h4>Nome Sobrenome</h4>
                        <p>Algo sobre você.</p>
                        <div className="main-border-button">
                          <a href="perfileditar.php">Editar perfil</a>
                        </div>
                        <a className="pinguim" href="#">
                          <u>Ver meu plano</u>
                        </a>
                      </div>
                    </div>
                    <div className="col-lg-4 align-self-center">
                      <ul>
                        <li>
                          Treinos concluidos <span>21</span>
                        </li>
                        <li>
                          Horas de treino<span>16</span>
                        </li>
                        <li>
                          Consumo de água por dia<span>2,42 litros</span>
                        </li>
                        <li>
                          Nível<span>Intermediário</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Treinos recentes */}
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="clips">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="heading-section">
                              <h4>Treinos recentes</h4>
                            </div>
                          </div>
                          <div className="row">
                            {[
                              {
                                img: "costasbiceps.webp",
                                title: "Costas e bíceps",
                                date: "20/05",
                              },
                              { img: "pernas.webp", title: "Pernas conjunto", date: "19/05" },
                              {
                                img: "ombrotrapezio.webp",
                                title: "Ombros e trapézio",
                                date: "17/05",
                              },
                              {
                                img: "peitotriceps.jpg",
                                title: "Peito e tríceps",
                                date: "16/05",
                              },
                            ].map((treino, idx) => (
                              <div className="col-lg-3 col-sm-6 chicagofire" key={idx}>
                                <div className="item">
                                  <img
                                    src={`assets/images/${treino.img}`}
                                    alt={treino.title}
                                  />
                                  <h4>Concluido</h4>
                                  <ul>
                                    <li>{treino.title}</li>
                                    <li>{treino.date}</li>
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ***** Banner End ***** */}
          </div>
        </div>
      </div>
    </div>
  );
}
