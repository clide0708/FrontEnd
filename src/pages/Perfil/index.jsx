import { useState, useEffect } from "react";
import perfilService from "../../services/Perfil/perfil";
import "../../assets/css/style.css";
import "../../assets/css/templatemo-cyborg-gaming.css";
import "./style.css";
import PlanModal from "./modalPlano.jsx";
import CropModal from "./modalCrop.jsx";
import { FiLogOut } from "react-icons/fi"; // engrenagemzinha
import { useNavigate } from "react-router-dom"; // Adicione

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [form, setForm] = useState({});
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [email, setEmail] = useState(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
    return usuario.email || "";
  });
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const navigate = useNavigate();

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
      setLoadingHistorico(true);
      const data = await perfilService.getHistoricoTreinos();
      if (data.success) {
        setHistorico(data.historico || []);
      }
      setLoadingHistorico(false);
    };
    fetchHistorico();
  }, []);

  const handleRetomar = async (idSessao) => {
    const data = await perfilService.retomarTreino(idSessao);
    if (data.success) {
      // Navegar para página de treino com estado
      navigate('/treinando', { 
        state: { 
          treino: data.treino, 
          progresso: data.progresso,
          idSessao: data.idSessao  // Para salvar progresso ao retomar
        } 
      });
    } else {
      alert('Erro ao retomar treino');
    }
  };

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

            // Na renderização, adicione a seção abaixo da seção "Treinos recentes"
            {loadingHistorico ? (
              <p>Carregando histórico...</p>
            ) : (
              <div className="historico-section">
                <h4>Histórico de Treinos (Último Mês)</h4>
                {historico.length === 0 ? (
                  <p>Nenhum treino registrado no último mês.</p>
                ) : (
                  <div className="historico-grid">
                    {historico.map((item) => (
                      <div key={item.idSessao} className="historico-card">
                        <h5>{item.nome_treino}</h5>
                        <p>{item.descricao}</p>
                        <p>Data: {new Date(item.data_inicio).toLocaleDateString('pt-BR')}</p>
                        <span className={`status ${item.status}`}>
                          {item.status === 'concluido' ? 'Concluído' : 'Em Progresso'}
                          {item.status === 'concluido' && item.duracao_total && (
                            <span> ({item.duracao_total}s)</span>
                          )}
                        </span>
                        {item.status === 'em_progresso' && (
                          <button onClick={() => handleRetomar(item.idSessao)}>
                            Retomar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
