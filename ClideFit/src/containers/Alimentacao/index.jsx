import { useState, useEffect } from "react";
import ModalAdd from "./modalAdd";
import ModalDetalhes from "./modalDetalhes";
import "./style.css";
import { calcularIMC, calcularIDR, consumoAgua } from "../../utils/calculos";

function Alimentacao() {
  const [dataHoje, setDataHoje] = useState("");
  const [user, setUser] = useState({
    nome: "",
    idade: 0,
    peso: 0,
    altura: 0,
    genero: "",
    treino: "",
    meta: 0,
    img: "",
  });

  const [caltotal, setCalTotal] = useState(0);
  const [refeicoes, setRefeicoes] = useState({
    cafe: {
      tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 },
      items: [],
    },
    almoco: {
      tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 },
      items: [],
    },
    janta: {
      tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 },
      items: [],
    },
    outros: {
      tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 },
      items: [],
    },
  });

  const [modalAdd, setModalAdd] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [currentMealList, setCurrentMealList] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [cardAberto, setCardAberto] = useState("");

  // data de hoje
  useEffect(() => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    setDataHoje(`${dia}/${mes}`);
  }, []);

  // carregar usuário
  useEffect(() => {
    fetch("/user.json")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar user.json");
        return res.json();
      })
      .then((data) => {
        const genero =
          data.genero && data.genero.toLowerCase() === "masculino"
            ? "Masculino"
            : "Feminino";
        const treino =
          data.treino && data.treino.length > 0
            ? data.treino.charAt(0).toUpperCase() +
              data.treino.slice(1).toLowerCase()
            : "";
        setUser({
          nome: data.nome || "",
          idade: Number(data.idade) || 0,
          peso: Number(data.peso) || 0,
          altura: Number(data.altura) || 0,
          genero: genero,
          treino: treino,
          meta: Number(data.meta) || 0,
          img:
            data.img && data.img.startsWith("/")
              ? data.img
              : data.img
              ? "/" + data.img
              : "",
        });
      })
      .catch((err) => console.error("Erro ao carregar usuário:", err));
  }, []);

  // fetch das refeições
  useEffect(() => {
    fetch("/dados.json")
      .then((res) => res.json())
      .then((dados) => {
        setRefeicoes({
          cafe: { tot: dados.cafe.totais, items: dados.cafe.items },
          almoco: { tot: dados.almoco.totais, items: dados.almoco.items },
          janta: { tot: dados.janta.totais, items: dados.janta.items },
          outros: { tot: dados.outros.totais, items: dados.outros.items },
        });
        const totalCal = ["cafe", "almoco", "janta", "outros"].reduce(
          (acc, r) => acc + dados[r].totais.calorias,
          0
        );
        setCalTotal(totalCal);
      })
      .catch((err) => console.error(err));
  }, []);

  const abrirModalDetalhes = (lista, item) => {
    setCurrentMealList(lista);
    setCurrentItem(item);
    setModalDetalhes(true);
  };

  const toggleCard = (refeicao) => {
    setCardAberto((prev) => (prev === refeicao ? "" : refeicao));
  };

  const calRes = () => Math.max(user.meta - caltotal, 0);

  return (
    <div className="alimentacao">
      <header></header>
      <div className="container">
        <div className="geral">
          {/* alimentação */}
          <div className="alim-content">
            <div className="pt1">
              <div className="heading-section">
                <h4 className="data">{dataHoje}</h4>
              </div>
              <div className="caltotal">
                <h1>Calorias</h1>
                <h1>{caltotal}</h1>
              </div>
            </div>

            <div className="pt2">
              <h2>
                Prot -{" "}
                {Object.values(refeicoes).reduce(
                  (acc, r) => acc + (r.tot.proteinas || 0),
                  0
                )}
                g
              </h2>
              <h2>
                Carb -{" "}
                {Object.values(refeicoes).reduce(
                  (acc, r) => acc + (r.tot.carboidratos || 0),
                  0
                )}
                g
              </h2>
              <h2>
                Gord -{" "}
                {Object.values(refeicoes).reduce(
                  (acc, r) => acc + (r.tot.gorduras || 0),
                  0
                )}
                g
              </h2>
            </div>

            <div className="refeicoes">
              {["cafe", "almoco", "janta", "outros"]
                .filter(
                  (refeicao) => cardAberto === "" || cardAberto === refeicao
                ) // só mostra o aberto ou todos se vazio
                .map((refeicao) => {
                  const tot = refeicoes[refeicao].tot;
                  const items = refeicoes[refeicao].items;
                  const isAtivo = cardAberto === refeicao;

                  return (
                    <div
                      key={refeicao}
                      className={`ref ${isAtivo ? "ativa" : ""}`}
                      onClick={() => toggleCard(refeicao)}
                    >
                      <div className="refln">
                        <h1>
                          {refeicao === "cafe"
                            ? "Café da manhã"
                            : refeicao.charAt(0).toUpperCase() +
                              refeicao.slice(1)}
                        </h1>
                        <h2>{tot.calorias} Cal</h2>
                      </div>

                      <div className={`contalm ${isAtivo ? "" : "oculto"}`}>
                        <div className="tableheadref">
                          <h1>Prot - {tot.proteinas}g</h1>
                          <h1>Carb - {tot.carboidratos}g</h1>
                          <h1>Gord - {tot.gorduras}g</h1>
                        </div>
                        <div className="tablescrollref">
                          {items.map((item) => (
                            <table
                              key={item.id}
                              className="tableref"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalDetalhes(refeicao, item);
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td>{item.nome}</td>
                                  <td>{item.especificacao} g/ml</td>
                                </tr>
                              </tbody>
                            </table>
                          ))}
                        </div>
                        <div className="btns">
                          <button
                            type="button"
                            className="add-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMealList(refeicao);
                              setModalAdd(true);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="metas">
              <h4>Sua meta</h4>
              <div className="metaalign">
                <div className="metatbl">
                  <div className="metapt1">
                    <h1>
                      <span id="metacal">{user.meta || "??"}</span>
                    </h1>
                  </div>
                  <div className="metapt2">
                    <h1>
                      <span id="calres">{calRes()}</span>
                    </h1>
                    <h2>cal restantes</h2>
                  </div>
                </div>
                <div className="metadt">
                  <h3>Ganho de massa</h3>
                  <h5>60kg - 80kg</h5>
                  {/* <button className="btnperfil">Alterar meta</button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Perfil */}
          <div className="pfl-content">
            <div className="heading-section">
              <h4 className="nmpfl">{user.nome}</h4>
            </div>
            <div className="pflaln">
              <div className="sts">
                <ul>
                  <li>Peso</li>
                  <p>{user.peso > 0 ? user.peso : "-"}</p>
                  <li>Altura</li>
                  <p>{user.altura > 0 ? user.altura : "-"}</p>
                  <li>Gênero</li>
                  <p>{user.genero || "-"}</p>
                  <li>Treino</li>
                  <p>{user.treino || "-"}</p>
                </ul>
              </div>
              <div className="pflft">
                <img src={user.img || "/default-profile.png"} alt="Perfil" />
                {/* <button className="btnperfil2">Editar perfil</button> */}
              </div>
            </div>
            <div className="pflidc">
              <ul>
                <li>
                  IDR{" "}
                  <span>
                    {user.peso > 0 && user.altura > 0 && user.idade > 0
                      ? calcularIDR(
                          user.peso,
                          user.altura,
                          user.idade,
                          user.genero,
                          user.treino
                        )
                      : "-"}
                  </span>
                </li>
                <li>
                  IMC{" "}
                  <span>
                    {user.peso > 0 && user.altura > 0
                      ? calcularIMC(user.peso, user.altura, user.genero)
                      : "-"}
                  </span>
                </li>
                <li>
                  Consumo de água ideal{" "}
                  <span>{user.peso > 0 ? consumoAgua(user.peso) : "-"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {modalAdd && (
        <ModalAdd
          fechar={() => setModalAdd(false)}
          currentMealList={currentMealList} // ⬅️ importante
          abrirModalDetalhes={abrirModalDetalhes} // ⬅️ importante
        />
      )}
      {modalDetalhes && currentItem && (
        <ModalDetalhes
          item={currentItem}
          fechar={() => setModalDetalhes(false)}
        />
      )}
    </div>
  );
}

export default Alimentacao;
