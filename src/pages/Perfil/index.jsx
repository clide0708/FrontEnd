import { useState, useEffect } from "react";
import perfilService from "../../services/Perfil/perfil.jsx";
import "../../assets/css/style.css";
import "../../assets/css/templatemo-cyborg-gaming.css";
import "./style.css";
import PlanModal from "./modalPlano.jsx";
import CropModal from "./modalCrop.jsx";
import { FiSettings } from "react-icons/fi"; // engrenagemzinha

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
    <div className="container" style={{ position: "relative" }}>
      {/* ENGRENAGEM LOGOUT */}
      <div className="logout-gear" onClick={handleLogout} title="Sair">
        <FiSettings size={30} />
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

            {/* TREINOS RECENTES */}
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
                        {
                          img: "pernas.webp",
                          title: "Pernas conjunto",
                          date: "19/05",
                        },
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
                        <div className="col-lg-3 col-sm-6" key={idx}>
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
    </div>
  );
}
