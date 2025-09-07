import { useState, useEffect } from "react";
import "./style.css";


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
    cafe: { tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }, items: [] },
    almoco: { tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }, items: [] },
    janta: { tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }, items: [] },
    outros: { tot: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }, items: [] },
  });
  const [modalAdd, setModalAdd] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [currentMealList, setCurrentMealList] = useState("");
  const [currentItem, setCurrentItem] = useState(null);

  // Data de hoje
  useEffect(() => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    setDataHoje(`${dia}/${mes}`);
  }, []);

  // Carregar usuário
  useEffect(() => {
    fetch("assets/js/user.json")
      .then((res) => res.json())
      .then((data) => {
        setUser({
          nome: data.nome,
          idade: data.idade,
          peso: data.peso,
          altura: data.altura,
          genero: data.genero,
          treino: data.treino === "Sedentario" ? "Sedentário" : data.treino,
          meta: data.meta,
          img: data.img,
        });
      })
      .catch((err) => console.error(err));
  }, []);

  // Funções de cálculo
  const calcularIMC = () => {
    if (!user.peso || !user.altura) return "";
    const imc = user.peso / ((user.altura / 100) ** 2);
    if (user.genero === "Masculino") {
      if (imc < 20) return "Abaixo do peso";
      else if (imc < 25) return "Normal";
      else if (imc < 30) return "Sobrepeso";
      else if (imc < 35) return "Obesidade grau I";
      else if (imc < 40) return "Obesidade grau II";
      else return "Obesidade grau III";
    } else {
      if (imc < 19) return "Abaixo do peso";
      else if (imc < 24) return "Normal";
      else if (imc < 29) return "Sobrepeso";
      else if (imc < 34) return "Obesidade grau I";
      else if (imc < 39) return "Obesidade grau II";
      else return "Obesidade grau III";
    }
  };

  const calcularIDR = () => {
    if (!user.peso || !user.altura || !user.idade) return "";
    let TMB;
    if (user.genero === "Masculino") {
      TMB = 10 * user.peso + 6.25 * user.altura - 5 * user.idade + 5;
    } else {
      TMB = 10 * user.peso + 6.25 * user.altura - 5 * user.idade - 161;
    }
    let fator = 1.2;
    if (user.treino === "Leve") fator = 1.375;
    else if (user.treino === "Moderado") fator = 1.55;
    else if (user.treino === "Intenso") fator = 1.725;
    else if (user.treino === "Extremo") fator = 1.9;

    return Math.round(TMB * fator) + " Kcal";
  };

  const consumoAgua = () => {
    return (user.peso * 0.037).toFixed(1) + " L/dia";
  };

  const calRes = () => {
    return Math.max(user.meta - caltotal, 0);
  };

  // abrir modal detalhes
  const abrirModalDetalhes = (lista, item) => {
    setCurrentMealList(lista);
    setCurrentItem(item);
    setModalDetalhes(true);
  };

  const fecharModalDetalhes = () => {
    setModalDetalhes(false);
  };

  return (
    <div className="alimentacao">

      {/* Header */}
      <header>{/* aqui você inclui o header.php se quiser */}</header>

      {/* Modal adicionar */}
      {modalAdd && (
        <div className="modalalimento show">
          <div className="modalalm-content">
            <div className="addalm">
              <h4>Adicionar alimentos</h4>
            </div>
            <div className="psqsalm">
              <input className="inmputmodal" placeholder="Pesquisar alimento..." />
              <div className="sugestoes"></div>
            </div>
            <div className="IAinput">
              <input type="file" />
              <label className="imgialabel">Upload IMG</label>
            </div>
            <div className="almadd">
              <div className="existing-items">
                <div className="tbladdmdl"></div>
              </div>
              <div className="addalmbtn">
                <button className="mdlcl">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalhes */}
      {modalDetalhes && currentItem && (
        <div className="modalalimento2 modal-stack show">
          <div className="modalalm2-content">
            <div className="addalm">
              <h4>Detalhes do Alimento</h4>
            </div>
            <div className="infnm">
              <h2>{currentItem.nome}</h2>
              <div className="select">
                <input type="number" defaultValue={currentItem.especificacao} /> g/ml
              </div>
            </div>
            <div className="infnt">
              <div className="header">
                <h1 className="cal">Cal</h1>
                <h1>Prot</h1>
                <h1>Carb</h1>
                <h1>Gord</h1>
              </div>
              <div className="valores">
                <h1 className="cal">{currentItem.calorias}</h1>
                <h1>{currentItem.proteinas}g</h1>
                <h1>{currentItem.carboidratos}g</h1>
                <h1>{currentItem.gorduras}g</h1>
              </div>
              <div className="btndv">
                <button className="btn2" onClick={fecharModalDetalhes}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Container principal */}
      <div className="container">
        <div className="geral">
          {/* Alimentação */}
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
              <h2>Prot - 0g</h2>
              <h2>Carb - 0g</h2>
              <h2>Gord - 0g</h2>
            </div>
            {/* Refeições */}
            {["cafe", "almoco", "janta", "outros"].map((ref) => (
              <div key={ref} className="ref">
                <div className="refln">
                  <h1>{ref}</h1>
                  <h2>{refeicoes[ref].tot.calorias} Cal</h2>
                </div>
              </div>
            ))}
          </div>

          {/* Perfil */}
          <div className="pfl-content">
            <div className="heading-section">
              <h4 className="nmpfl">{user.nome}</h4>
            </div>
            <div className="pflaln">
              <div className="sts ">
                <ul>
                  <li>Peso</li>
                  <p>{user.peso}</p>
                  <li>Altura</li>
                  <p>{user.altura}</p>
                  <li>Gênero</li>
                  <p>{user.genero}</p>
                  <li>Treino</li>
                  <p>{user.treino}</p>
                </ul>
              </div>
              <div className="pflft">
                <img src={user.img} alt="" />
                <button className="btnperfil2">Editar perfil</button>
              </div>
            </div>
            <div className="pflidc">
              <ul>
                <li>Consumo de água ideal {consumoAgua()}</li>
                <li>IMC {calcularIMC()}</li>
                <li>IDR {calcularIDR()}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alimentacao;
