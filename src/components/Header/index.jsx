import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import profileImg from "/assets/images/profilefoto.png";
import "../../assets/css/templatemo-cyborg-gaming.css";
import "../../assets/css/style.css";
import { FaBell } from "react-icons/fa";
import NotificacoesModal from "../Notification"; // verifica se o caminho tá certo
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [notModalOpen, setNotModalOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([
    "Mensagem do personal",
    "pt2",
  ]);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user && user.tipo) {
      setUserRole(user.tipo);
    }
  }, []);

  return (
    <header className="nav-header">
      <div className="container">
        <div className="nav-bar">
          <h1>
            <Link className="nav-CF" to="/home">
              ClideFit
            </Link>
          </h1>

          <div className="menu-icon" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-menu ${menuOpen ? "show" : ""}`}>
            <li>
              <Link
                to="/home"
                className={
                  location.pathname === "/" || location.pathname === "/home"
                    ? "active"
                    : ""
                }
              >
                Início
              </Link>
            </li>

            <li>
              <Link
                to="/alimentacao"
                className={location.pathname === "/alimentacao" ? "active" : ""}
              >
                Alimentação
              </Link>
            </li>

            <li>
              <Link
                to="/treinos"
                className={
                  location.pathname === "/treinos" ||
                  location.pathname === "/treinando"
                    ? "active"
                    : ""
                }
              >
                Treinos
              </Link>
            </li>

            {userRole === "personal" && (
              <li>
                <Link
                  to="/personal"
                  className={location.pathname === "/personal" ? "active" : ""}
                >
                  Alunos
                </Link>
              </li>
            )}

            <li
              className="notif-item"
              style={{
                position: "relative",
                display: "inline-block",
                marginRight: "20px",
              }}
            >
              <FaBell
                className="notif-icon"
                onClick={() => setNotModalOpen(true)}
                size={24}
              />

              {notificacoes.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    minWidth: "18px",
                    textAlign: "center",
                  }}
                >
                  {notificacoes.length}
                </span>
              )}
            </li>

            <li className="profile-item">
              <Link
                to="/perfil"
                className={`profile-link ${
                  location.pathname === "/perfil" ? "pfact" : ""
                }`}
              >
                <span>Perfil</span>
                <img src={profileImg} alt="Foto de perfil" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <NotificacoesModal
        isOpen={notModalOpen}
        onClose={() => setNotModalOpen(false)}
        notificacoes={notificacoes}
      />
    </header>
  );
}
