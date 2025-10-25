import { useState, useEffect } from "react";
import perfilService from "../../services/Perfil/perfil";
import "../../assets/css/style.css";
import "../../assets/css/templatemo-cyborg-gaming.css";
import "./style.css";
import PlanModal from "./modalPlano.jsx";
import CropModal from "./modalCrop.jsx";
import { FiLogOut } from "react-icons/fi";
import treinosService from "../../services/Treinos/treinos";
import { useNavigate } from "react-router-dom";
import { color } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [form, setForm] = useState({});
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [historicoTreinos, setHistoricoTreinos] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
    return usuario.email || "";
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!email) return;
      const data = await perfilService.getPerfil(email);
      if (data && data.success) {
        const treinoMap = { Sedentário: 1, Leve: 2, Moderado: 3, Intenso: 4 };
        const metaMap = {
          "Perder peso": 1,
          "Manter peso": 2,
          "Ganhar peso": 3,
        };
        setUser(data.data);
        setForm({
          ...data.data,
          treinoValue: treinoMap[data.data.treinoTipo] || 1,
          metaValue: metaMap[data.data.meta] || 1,
        });
      }
    };
    fetchPerfil();
  }, [email]);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await treinosService.getHistoricoTreinos();
        
        // CORREÇÃO: Acessar a estrutura correta
        if (response.success) {
          setHistoricoTreinos(response.treinos || []);
        } else {
          setHistoricoTreinos([]);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setHistoricoTreinos([]);
      } finally {
        setLoadingHistorico(false);
      }
    };
    fetchHistorico();
  }, []);

  useEffect(() => {
    const fetchPersonal = async () => {
      if (user?.idPersonal) {
        const res = await perfilService.getPersonalPorId(user.idPersonal);
        if (res?.success) {
          setUser((prev) => ({ ...prev, personal_nome: res.data.nome }));
          setForm((prev) => ({ ...prev, personal_nome: res.data.nome }));
        }
      }
    };
    fetchPersonal();
  }, [user?.idPersonal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveCrop = (croppedImage) => {
    setForm({ ...form, foto_perfil: croppedImage });
    setCropModalOpen(false);
  };

  const saveProfile = async () => {
    const result = await perfilService.atualizarPerfil(form);
    if (result.success) {
      setUser({ ...form });
      setEditing(false);
    } else {
      alert("Erro ao atualizar perfil: " + result.error);
    }
  };

  const handleCardClick = async (treino) => {
    console.log("Treino clicado:", treino);
    
    if (treino.porcentagem_concluida >= 90) {
        navigate(`/treinos/visualizar/${treino.idTreino}`);
    } else {
        try {
            console.log("Buscando sessão para retomar:", treino.idSessao);
            const response = await treinosService.getSessaoParaRetomar(treino.idSessao);
            console.log("Resposta completa da sessão:", response);
            
            if (!response.success) {
                throw new Error(response.error || "Erro ao buscar sessão");
            }

            const { sessao, treino: treinoData, progresso } = response;
            
            if (!treinoData || !treinoData.exercicios) {
                console.error("Dados do treino incompletos:", treinoData);
                throw new Error("Dados do treino incompletos");
            }

            console.log("Exercícios encontrados:", treinoData.exercicios.length);

            const treinoParaRetomar = {
                ...treinoData,
                idSessao: sessao.idSessao,
                exercicios: treinoData.exercicios.map(ex => ({
                    ...ex,
                    id: ex.id || ex.idTreino_Exercicio,
                    series: ex.series || 3,
                    repeticoes: ex.repeticoes || 10,
                    descanso: ex.descanso || 60,
                    carga: ex.carga || 0,
                    url: ex.video_url || ex.url || "",
                    grupo: ex.grupoMuscular || ex.grupo || "",
                    informacoes: ex.descricao || ex.informacoes || "",
                    nome: ex.nome || "Exercício sem nome"
                }))
            };
            
            console.log("Treino preparado para retomar:", treinoParaRetomar);
            
            navigate("/treinando", {
                state: { 
                    treino: treinoParaRetomar,
                    progresso: progresso 
                }
            });
        } catch (err) {
            console.error("Erro detalhado ao retomar treino:", err);
            alert(`Erro ao retomar treino: ${err.message}`);
        }
    }
  };

  const getYoutubeThumbnail = (url) => {
    if (!url) return "/assets/images/no-video-placeholder.jpg"; // Fallback local
    
    try {
      const u = new URL(url);
      let id = "";
      if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v") || "";
      else if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
      
      if (!id) return "/assets/images/no-video-placeholder.jpg";
      
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    } catch (error) {
      return "/assets/images/no-video-placeholder.jpg";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (!user) return <p>Carregando...</p>;

  return (
    <div className="perfil container" style={{ position: "relative" }}>
      {/* ENGRENAGEM LOGOUT */}
      <div className="logout-gear" onClick={handleLogout} title="Sair">
        <FiLogOut size={30} />
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="page-content">
            <div className="main-profile">
              <div className="row">
                {/* FOTO */}
                <div className="col-lg-4">
                  {editing ? (
                    <div
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                        border: "1px dashed #ccc",
                        borderRadius: "23px",
                        padding: "20px",
                      }}
                      onClick={() => setCropModalOpen(true)}
                    >
                      <p>Editar Foto</p>
                      <img
                        src={form.foto_perfil || user.foto_perfil}
                        alt="perfil"
                        style={{
                          borderRadius: "23px",
                          width: "100%",
                          maxHeight: "300px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <img
                      src={user.foto_perfil}
                      alt="perfil"
                      style={{ borderRadius: "23px", width: "100%" }}
                    />
                  )}
                </div>

                {/* INFORMAÇÕES */}
                <div className="col-lg-4 align-self-center">
                  <div className="main-info header-text">
                    {editing ? (
                      <>
                        <input
                          type="text"
                          name="nome"
                          value={form.nome || ""}
                          onChange={handleChange}
                          placeholder="Nome"
                        />
                        <input
                          type="number"
                          name="idade"
                          value={form.idade || ""}
                          onChange={handleChange}
                          placeholder="Idade"
                        />
                        <input
                          type="number"
                          name="peso"
                          value={form.peso || ""}
                          onChange={handleChange}
                          placeholder="Peso"
                        />
                        <input
                          type="number"
                          name="altura"
                          value={form.altura || ""}
                          onChange={handleChange}
                          placeholder="Altura"
                        />
                        <select
                          name="genero"
                          value={form.genero || ""}
                          onChange={handleChange}
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>

                        <div className="slider-container">
                          <label>Treino: {form.treinoTipo}</label>
                          <input
                            type="range"
                            min="1"
                            max="4"
                            step="1"
                            value={form.treinoValue || 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              const treinoMap = {
                                1: "Sedentário",
                                2: "Leve",
                                3: "Moderado",
                                4: "Intenso",
                              };
                              setForm({
                                ...form,
                                treinoTipo: treinoMap[val],
                                treinoValue: val,
                              });
                            }}
                          />
                        </div>
                        <div className="slider-container">
                          <label>Meta: {form.meta}</label>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="1"
                            value={form.metaValue || 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              const metaMap = {
                                1: "Perder peso",
                                2: "Manter peso",
                                3: "Ganhar peso",
                              };
                              setForm({
                                ...form,
                                meta: metaMap[val],
                                metaValue: val,
                              });
                            }}
                          />
                        </div>

                        <div style={{ marginTop: "10px" }}>
                          <button onClick={saveProfile} className="savebtnpf">
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditing(false);
                              setForm({ ...user });
                            }}
                            className="savebtnpf"
                            style={{ marginLeft: "10px" }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4>{user.nome}</h4>
                        <p>
                          {user.idade ?? "—"} anos - {user.peso ?? "—"}kg -{" "}
                          {user.altura ?? "—"}cm
                        </p>
                        <p>Gênero: {user.genero ?? "—"}</p>
                        <p>Treino: {user.treinoTipo ?? "—"}</p>
                        <p>Meta: {user.meta ?? "—"}</p>
                        <div className="main-border-button">
                          <button onClick={() => setEditing(true)}>
                            Editar perfil
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* PLANO */}
                <div className="col-lg-4 align-self-center">
                  <ul className="infopfl">
                    <li>
                      Plano <span>{user.tipoPlano || "Premium"}</span>
                    </li>
                    <li>
                      Personal <span>{user.personal_nome || "Nenhum"}</span>
                    </li>
                    <button
                      className="savebtnpf"
                      onClick={() => setEditingPlan(true)}
                    >
                      Editar Plano
                    </button>
                  </ul>
                </div>
              </div>

              {/* MODAIS */}
              {editingPlan && (
                <PlanModal
                  onClose={() => setEditingPlan(false)}
                  onRemovePersonal={() => {
                    setUser({ ...user, personal_nome: null });
                    setForm({ ...form, personal_nome: null });
                  }}
                  onChoosePlan={(planName) => {
                    setUser({ ...user, plano: planName });
                    setEditingPlan(false);
                  }}
                />
              )}
              {cropModalOpen && (
                <CropModal
                  onClose={() => setCropModalOpen(false)}
                  onSave={handleSaveCrop}
                />
              )}
            </div>

            {/* NOVA SEÇÃO: HISTÓRICO DE TREINOS COM CARDS */}
                <div className="clips">
                    <div className="col-lg-12">
                      <div className="heading-section">
                        <h4>Histórico de Treinos (Último Mês)</h4>
                      </div>
                    </div>
                    {loadingHistorico ? (
                      <div className="col-lg-12">
                        <p>Carregando...</p>
                      </div>
                    ) : historicoTreinos.length > 0 ? (
                      <div className="row">
                        {historicoTreinos.map((treino, idx) => {
                          const statusText = treino.porcentagem_concluida >= 90 
                            ? "Concluído" 
                            : `Em Progresso`;
                          const thumbnail = getYoutubeThumbnail(treino.primeiro_video_url || "");
                          return (
                            <div className="col-lg-3 col-sm-6" key={idx}>
                              <div 
                                className="item" 
                                onClick={() => handleCardClick(treino)}
                                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                              >
                                <strong style={{fontSize: "2.5rem"}}>{treino.nome_treino}</strong>
                                <br />
                                <br />
                                <img
                                  src={thumbnail}
                                  alt={treino.nome_treino}
                                  style={{ width: "100%", height: "18rem", objectFit: "cover" }}
                                />
                                <br />
                                <div className="row">
                                  <div className="col-lg-12">
                                    <h4 style={{fontSize: "2rem", color: "#2d74c4", padding: "5px" }}>{statusText}</h4>
                                    <br />
                                    <h4 style={{fontSize: "1.8rem", color: "#ffffffff" }}>{treino.data_formatada}</h4>
                                  </div>
                                  <div className="col-lg-12">
                                    <ul>
                                      <li style={{marginBottom: "10px", marginTop: "20px", paddingBottom: "10px", paddingTop: "20px"}}>
                                        <strong style={{fontSize: "1.5rem", padding: "10px"}}>
                                        Descrição:
                                        </strong>
                                        <br />
                                        <small style={{fontSize: "1rem"}}>{treino.descricao || "Sem descrição"}</small>
                                      </li>
                                      <li style={{marginBottom: "10px", paddingBottom: "10px"}}>
                                        <strong style={{fontSize: "1.5rem"}}> 
                                          Tipo do treino:
                                        </strong>
                                        <br />
                                        <small style={{fontSize: "1.2rem"}}>
                                          {treino.tipo_display}
                                        </small>
                                      </li>
                                      <li style={{marginBottom: "10px", paddingBottom: "10px"}}>
                                        <strong style={{fontSize: "1.5rem"}}> 
                                          Cadastrado por: 
                                        </strong>
                                        <br />
                                        <small style={{fontSize: "1.2rem"}}>
                                          {treino.nome_criador || "Desconhecido"}
                                        </small>
                                      </li>
                                      <li style={{marginBottom: "10px", paddingBottom: "10px"}}>
                                        {treino.porcentagem_concluida < 100 && (
                                          <strong style={{fontSize: "1.5rem", color: "#2d74c4", padding: "10px"}}>
                                            {treino.porcentagem_concluida}% concluído
                                          </strong>
                                        )}
                                      </li>
                                      <br />
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="col-lg-12">
                        <p>Nenhum treino recente.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
  );
}