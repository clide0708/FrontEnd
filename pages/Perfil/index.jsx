import { useState, useEffect } from "react";
import "../../assets/css/style.css";
import "../../assets/css/templatemo-cyborg-gaming.css";
import "./style.css";
import PlanModal from "./modalPlano.jsx";
import LogoutButton from "../../components/Buttons/Logout.jsx";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetch("/logado.json")
      .then((res) => {
        if (!res.ok) throw new Error("Arquivo JSON não encontrado");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setForm({
          ...data,
          treinoValue:
            data.treino === "Sedentário"
              ? 1
              : data.treino === "Leve"
                ? 2
                : data.treino === "Moderado"
                  ? 3
                  : 4,
          metaValue:
            data.meta === "Perder peso"
              ? 1
              : data.meta === "Manter peso"
                ? 2
                : 3,
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    setUser(form);
    setEditing(false);

    // aqui tu pode mandar pro backend
    fetch("/logado.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao salvar no JSON");
        return res.json();
      })
      .then((data) => console.log("Dados salvos:", data))
      .catch((err) => console.error(err));
  };

  if (!user) return <p>Carregando...</p>;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="page-content">
            <div className="main-profile">
              <div className="row">
                <div className="col-lg-4">
                  {editing ? (
                    <label style={{ cursor: "pointer", width: "100%" }}>
                      <img
                        src={form.img || user.img}
                        alt="perfil"
                        style={{ borderRadius: "23px", width: "100%", opacity: 0.6 }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setForm({ ...form, img: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <img
                      src={user.img}
                      alt="perfil"
                      style={{ borderRadius: "23px", width: "100%" }}
                    />
                  )}
                </div>

                <div className="col-lg-4 align-self-center">
                  <div className="main-info header-text">
                    {editing ? (
                      <>
                        <input
                          type="text"
                          name="nome"
                          value={form.nome}
                          onChange={handleChange}
                          placeholder="Nome"
                        />
                        <input
                          type="number"
                          name="idade"
                          value={form.idade}
                          onChange={handleChange}
                          placeholder="Idade"
                        />
                        <input
                          type="number"
                          name="peso"
                          value={form.peso}
                          onChange={handleChange}
                          placeholder="Peso"
                        />
                        <input
                          type="number"
                          name="altura"
                          value={form.altura}
                          onChange={handleChange}
                          placeholder="Altura"
                        />
                        <select
                          name="genero"
                          value={form.genero}
                          onChange={handleChange}
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>

                        <div className="slider-container">
                          <label>Treino: {form.treino}</label>
                          <input
                            type="range"
                            min="1"
                            max="4"
                            step="1"
                            value={form.treinoValue}
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
                                treino: treinoMap[val],
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
                            value={form.metaValue}
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
                          {user.idade} anos - {user.peso}kg - {user.altura}cm
                        </p>
                        <p>Gênero: {user.genero}</p>
                        <p>Treino: {user.treino}</p>
                        <p>Meta: {user.meta}</p>
                        <div className="main-border-button">
                          <button onClick={() => setEditing(true)}>
                            Editar perfil
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-lg-4 align-self-center">
                  <ul className="infopfl">
                    <li>
                      Plano <span>{user.plano || "Premium"}</span>
                    </li>
                    <li>
                      Personal <span>{user.personal || "Gustavo Dandalo"}</span>
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

              {editingPlan && (
                <PlanModal
                  onClose={() => setEditingPlan(false)}
                  onRemovePersonal={() => {
                    setUser({ ...user, personal: null });
                    setForm({ ...form, personal: null });
                  }}
                  onChoosePlan={(planName) => {
                    setUser({ ...user, plano: planName });
                    setEditingPlan(false);
                  }}
                />
              )}

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
                      <div className="logout-container">
                        <LogoutButton />
                      </div>
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
