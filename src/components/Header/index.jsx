// components/Header/index.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import profileImg from "/assets/images/profilefoto.png";
import "../../assets/css/templatemo-cyborg-gaming.css";
import "./style.css";
import { FaBell } from "react-icons/fa";
import NotificacoesModal from "../Notification";
import convitesService from "../../services/Notification/convites";
import perfilService from "../../services/Perfil/perfil";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [notModalOpen, setNotModalOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState(profileImg);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // 🔥 CORREÇÃO: Função para obter URL da foto (igual à do Perfil)
  const getFotoUrl = (fotoUrl) => {
    console.log("🖼️ Header - Processando foto URL:", fotoUrl);
    
    // Se não tem foto ou é inválida, retorna padrão
    if (!fotoUrl || fotoUrl === 'null' || fotoUrl === 'undefined' || fotoUrl === '') {
      console.log("🖼️ Header - Sem foto, usando padrão");
      return profileImg;
    }
    
    // Se já é uma URL completa (http ou https)
    if (fotoUrl.startsWith('http')) {
      console.log("🖼️ Header - URL completa detectada:", fotoUrl);
      return fotoUrl;
    }
    
    // Se é um caminho relativo, converter para URL absoluta
    let caminhoCorrigido = fotoUrl;
    
    // Se começa com /, remover a barra inicial para evitar duplicação
    if (caminhoCorrigido.startsWith('/')) {
      caminhoCorrigido = caminhoCorrigido.substring(1);
    }
    
    // Construir URL absoluta usando a base da API
    const urlBase = import.meta.env.VITE_API_URL.replace('/api', '');
    const urlAbsoluta = `${urlBase}${caminhoCorrigido}`;
    
    console.log("🖼️ Header - URL absoluta construída:", urlAbsoluta);
    return urlAbsoluta;
  };

  useEffect(() => {
    const carregarDadosUsuario = async () => {
      try {
        const usuarioStorage = localStorage.getItem("usuario");
        if (usuarioStorage) {
          const usuario = JSON.parse(usuarioStorage);
          setUsuarioLogado(usuario);
          setUserRole(usuario.tipo);

          if (usuario.email) {
            await carregarNotificacoes(usuario.email);
            await carregarFotoPerfil(usuario.email);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    carregarDadosUsuario();
  }, []);

  // 🔥 CORREÇÃO: Função para carregar foto do perfil
  const carregarFotoPerfil = async (email) => {
    try {
      console.log("🔄 Header - Carregando foto do perfil para:", email);
      
      const res = await perfilService.getPerfil(email);
      console.log("📊 Header - Resposta do perfil:", res);
      
      if (res?.success && res.data) {
        const usuario = res.data;
        
        // Verificar se tem foto_url no perfil básico
        if (usuario.foto_url) {
          const fotoUrl = getFotoUrl(usuario.foto_url);
          console.log("✅ Header - Foto encontrada no perfil básico:", fotoUrl);
          setFotoPerfil(fotoUrl);
          return;
        }
        
        // Se não tem foto no perfil básico, buscar perfil completo
        if (usuario.id && usuario.tipo) {
          console.log("🔍 Header - Buscando perfil completo para ID:", usuario.id);
          const perfilCompleto = await perfilService.getPerfilCompleto(usuario.id, usuario.tipo);
          console.log("📊 Header - Perfil completo:", perfilCompleto);
          
          if (perfilCompleto?.success && perfilCompleto.data?.foto_url) {
            const fotoUrl = getFotoUrl(perfilCompleto.data.foto_url);
            console.log("✅ Header - Foto encontrada no perfil completo:", fotoUrl);
            setFotoPerfil(fotoUrl);
            return;
          }
        }
        
        // Se chegou aqui, não encontrou foto
        console.log("ℹ️ Header - Nenhuma foto encontrada, usando padrão");
        setFotoPerfil(profileImg);
      } else {
        console.log("❌ Header - Erro na resposta do perfil:", res);
        setFotoPerfil(profileImg);
      }
    } catch (err) {
      console.error("❌ Header - Erro ao carregar foto de perfil", err);
      setFotoPerfil(profileImg);
    }
  };

  const carregarNotificacoes = async (email) => {
    try {
      const dados = await convitesService.getConvitesByEmail(email);
      setNotificacoes(dados || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setNotificacoes([]);
    }
  };

  // 🔥 NOVO: Escutar mudanças na foto do perfil (quando usuário atualiza no Perfil)
  useEffect(() => {
    const handleStorageChange = () => {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (usuario?.email) {
        carregarFotoPerfil(usuario.email);
      }
    };

    // Escutar evento personalizado quando a foto é atualizada
    window.addEventListener('fotoPerfilAtualizada', handleStorageChange);
    
    // Recarregar a foto quando a página for focada (útil quando volta do Perfil)
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('fotoPerfilAtualizada', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  return (
    <header className="nav-header">
      <div className="container">
        <div className="nav-bar">
          <h1>
            <Link className="nav-CF" to="/home">
              CLIDE Fit
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

            {/* Menu específico para alunos */}
            {userRole === "aluno" && (
              <>
                <li>
                  <Link
                    to="/alimentacao"
                    className={
                      location.pathname === "/alimentacao" ? "active" : ""
                    }
                  >
                    Alimentação
                  </Link>
                </li>
                <li>
                  <Link
                    to="/conectar"
                    className={
                      location.pathname === "/conectar" ? "active" : ""
                    }
                  >
                    Conectar a um Personal
                  </Link>
                </li>
              </>
            )}

            {/* Menu para treinos (disponível para todos) */}
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

            {/* Menu específico para personais */}
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

            {userRole === "personal" && (
              <li>
                <Link
                  to="/conectar"
                  className={location.pathname === "/conectar" ? "active" : ""}
                >
                  Encontre um Aluno
                </Link>
              </li>
            )}

            {/* Menu específico para academia */}
            {userRole === "academia" && (
              <li>
                <Link
                  to="/painel-controle"
                  className={
                    location.pathname === "/painel-controle" ? "active" : ""
                  }
                >
                  Painel de Controle
                </Link>
              </li>
            )}

            <div className="pipipiripii">
              {/* Notificações (apenas para alunos e personais) */}
              {(userRole === "aluno" || userRole === "personal") && (
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
              )}

              {/* Perfil (disponível para todos) */}
              <li className="profile-item">
                <Link
                  to="/perfil"
                  className={`profile-link ${
                    location.pathname === "/perfil" ? "pfact" : ""
                  }`}
                >
                  <span>Perfil</span>
                  <img 
                    src={fotoPerfil} 
                    alt="Foto de perfil" 
                    onError={(e) => {
                      console.error("❌ Header - Erro ao carregar imagem:", e);
                      e.target.src = profileImg;
                    }}
                    onLoad={(e) => {
                      console.log("✅ Header - Imagem carregada com sucesso:", e.target.src);
                    }}
                  />
                </Link>
              </li>
            </div>
          </ul>
        </div>
      </div>

      {/* Modal de notificações (apenas para alunos e personais) */}
      {(userRole === "aluno" || userRole === "personal") && (
        <NotificacoesModal
          isOpen={notModalOpen}
          onClose={() => setNotModalOpen(false)}
          notificacoes={notificacoes}
          refresh={() => usuarioLogado?.email && carregarNotificacoes(usuarioLogado.email)}
        />
      )}
    </header>
  );
}