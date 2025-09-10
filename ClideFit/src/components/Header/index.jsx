import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import profileImg from "/assets/images/profilefoto.png"
import '../../assets/css/templatemo-cyborg-gaming.css'
import '../../assets/css/style.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleMenu = () => setMenuOpen(!menuOpen)
  const location = useLocation()

  return (
    <header className="nav-header">
      <div className="container">
        <div className="nav-bar">
          <h1>
            <Link className="nav-CF" to="/">ClideFit</Link>
          </h1>

          <div className="menu-icon" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-menu ${menuOpen ? "show" : ""}`}>
            <li><Link to="/Home" className={location.pathname === "/" ? "active" : ""}>Início</Link></li>
            <li><Link to="/alimentacao" className={location.pathname === "/alimentacao" ? "active" : ""}>Alimentação</Link></li>
            <li><Link to="/Treinos" className={location.pathname === "/Treinos" || location.pathname === "/Treinos/treinando" ? "active" : ""}>Treinos</Link></li>
            <li><Link to="/personal" className={location.pathname === "/personal" ? "active" : ""}>Personal</Link></li>
            <li>
              <Link to="/perfil" className={`profile-link ${location.pathname === "/perfil" ? "pfact" : ""}`}>
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
