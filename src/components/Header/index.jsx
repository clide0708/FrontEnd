import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import profileImg from "/assets/images/profilefoto.png"
import '../../assets/css/templatemo-cyborg-gaming.css'
import '../../assets/css/style.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState(null) // vai pegar o "tipo" do usuário
  const toggleMenu = () => setMenuOpen(!menuOpen)
  const location = useLocation()

  useEffect(() => {
    // pega o usuário do localStorage
    const user = JSON.parse(localStorage.getItem("usuario"))
    if (user && user.tipo) {
      setUserRole(user.tipo) // agora usa "tipo" que vem do backend
    }
  }, [])

  return (
    <header className="nav-header">
      <div className="container">
        <div className="nav-bar">
          <h1>
            <Link className="nav-CF" to="/home">ClideFit</Link>
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
                className={location.pathname === "/" || location.pathname === "/home" ? "active" : ""}
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
                className={location.pathname === "/treinos" || location.pathname === "/treinos/treinando" ? "active" : ""}
              >
                Treinos
              </Link>
            </li>
            
            {/* só aparece se o cara for personal */}
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

            <li>
              <Link 
                to="/perfil" 
                className={`profile-link ${location.pathname === "/perfil" ? "pfact" : ""}`}
              >
                <span>Perfil</span>
                <img src={profileImg} alt="Foto de perfil" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
