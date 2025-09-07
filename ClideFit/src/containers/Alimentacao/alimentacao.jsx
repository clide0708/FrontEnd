import { useState, useEffect } from "react";
import ModalAdd from "./ModalAdd";
import ModalDetalhes from "./ModalDetalhes";
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
        if (!res.ok) {
          throw new Error("Erro ao carregar user.json");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Dados do usuário carregados:", data);

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
      .catch((err) => {
        console.error("Erro ao carregar usuário:", err);
      });
  }, []);

  const abrirModalDetalhes = (lista, item) => {
    setCurrentMealList(lista);
    setCurrentItem(item);
    setModalDetalhes(true);
  };

  const calRes = () => Math.max(user.meta - caltotal, 0);

  // debug do estado user
  useEffect(() => {
    console.log("Estado user atualizado:", user);
  }, [user]);

  //fetch das refeições

  fetch("dados.json")
    .then((res) => res.json())
    .then((dados) => {
      ["cafe", "almoco", "janta", "outros"].forEach((refeicao) => {
        const tot = dados[refeicao].totais;
        document.getElementById(
          `${refeicao}-cal`
        ).innerText = `${tot.calorias} Cal`;
        document.getElementById(
          `${refeicao}-prot`
        ).innerText = `Prot - ${tot.proteinas}g`;
        document.getElementById(
          `${refeicao}-carb`
        ).innerText = `Carb - ${tot.carboidratos}g`;
        document.getElementById(
          `${refeicao}-gord`
        ).innerText = `Gord - ${tot.gorduras}g`;

        const container = document.getElementById(`${refeicao}-items`);
        container.innerHTML = "";
        dados[refeicao].items.forEach((item) => {
          const tbl = document.createElement("table");
          tbl.className = "tableref";
          tbl.onclick = (e) => {
            e.stopPropagation();
            abrirModalDetalhes(refeicao, item.id);
          };
          tbl.innerHTML = `
          <tbody>
            <tr>
              <td>${item.nome}</td>
              <td>${item.especificacao} g/ml</td>
            </tr>
          </tbody>
        `;
          container.appendChild(tbl);
        });
      });
    })
    .catch((err) => console.error(err));

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
              {/* <button onClick={() => setModalAdd(true)}>
                Adicionar Alimento
              </button> */}
            </div>

            <div className="pt2">
              {/* totais de proteínas, carboidratos e gorduras */}
              <h2>
                Prot -{" "}
                {refeicoes
                  ? Object.values(refeicoes).reduce(
                      (acc, r) => acc + (r.tot.proteinas || 0),
                      0
                    )
                  : 0}
                g
              </h2>
              <h2>
                Carb -{" "}
                {refeicoes
                  ? Object.values(refeicoes).reduce(
                      (acc, r) => acc + (r.tot.carboidratos || 0),
                      0
                    )
                  : 0}
                g
              </h2>
              <h2>
                Gord -{" "}
                {refeicoes
                  ? Object.values(refeicoes).reduce(
                      (acc, r) => acc + (r.tot.gorduras || 0),
                      0
                    )
                  : 0}
                g
              </h2>
            </div>

            <div class="refeicoes">
              <div class="ref" id="cafe-ref">
                <div class="refln">
                  <h1>Café da manhã</h1>
                  <h2 id="cafe-cal">0 Cal</h2>
                </div>
                <div class="contalm oculto" id="cafe-cont">
                  <div class="tableheadref">
                    <h1 id="cafe-prot">Prot - 0g</h1>
                    <h1 id="cafe-carb">Carb - 0g</h1>
                    <h1 id="cafe-gord">Gord - 0g</h1>
                  </div>
                  <div class="tablescrollref" id="cafe-items"></div>
                  <div class="btns">
                    <button type="button" class="add-btn" data-lista="cafe">
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div class="ref" id="almoco-ref">
                <div class="refln">
                  <h1>Almoço</h1>
                  <h2 id="almoco-cal">0 Cal</h2>
                </div>
                <div class="contalm oculto" id="almoco-cont">
                  <div class="tableheadref">
                    <h1 id="almoco-prot">Prot - 0g</h1>
                    <h1 id="almoco-carb">Carb - 0g</h1>
                    <h1 id="almoco-gord">Gord - 0g</h1>
                  </div>
                  <div class="tablescrollref" id="almoco-items"></div>
                  <div class="btns">
                    <button type="button" class="add-btn" data-lista="almoco">
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div class="ref" id="janta-ref">
                <div class="refln">
                  <h1>Janta</h1>
                  <h2 id="janta-cal">0 Cal</h2>
                </div>
                <div class="contalm oculto" id="janta-cont">
                  <div class="tableheadref">
                    <h1 id="janta-prot">Prot - 0g</h1>
                    <h1 id="janta-carb">Carb - 0g</h1>
                    <h1 id="janta-gord">Gord - 0g</h1>
                  </div>
                  <div class="tablescrollref" id="janta-items"></div>
                  <div class="btns">
                    <button type="button" class="add-btn" data-lista="janta">
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div class="ref" id="outros-ref">
                <div class="refln">
                  <h1>Outros</h1>
                  <h2 id="outros-cal">0 Cal</h2>
                </div>
                <div class="contalm oculto" id="outros-cont">
                  <div class="tableheadref">
                    <h1 id="outros-prot">Prot - 0g</h1>
                    <h1 id="outros-carb">Carb - 0g</h1>
                    <h1 id="outros-gord">Gord - 0g</h1>
                  </div>
                  <div class="tablescrollref" id="outros-items"></div>
                  <div class="btns">
                    <button type="button" class="add-btn" data-lista="outros">
                      +
                    </button>
                  </div>
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
                <button className="btnperfil2">Editar perfil</button>
              </div>
            </div>
            <div className="pflidc">
              <ul>
                <li>
                  IDR{" "}
                  {user.peso > 0 && user.altura > 0 && user.idade > 0
                    ? calcularIDR(
                        user.peso,
                        user.altura,
                        user.idade,
                        user.genero,
                        user.treino
                      )
                    : "-"}
                </li>

                <li>
                  IMC{" "}
                  {user.peso > 0 && user.altura > 0
                    ? calcularIMC(user.peso, user.altura, user.genero)
                    : "-"}
                </li>
                <li>
                  Consumo de água ideal{" "}
                  {user.peso > 0 ? consumoAgua(user.peso) : "-"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {modalAdd && <ModalAdd fechar={() => setModalAdd(false)} />}
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
