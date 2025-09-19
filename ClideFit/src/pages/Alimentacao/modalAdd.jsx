import { useState, useEffect, useRef } from "react";
import "./style.css";

export default function ModalAdd({ fechar, currentMealList, abrirModalDetalhes }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [itensAdicionados, setItensAdicionados] = useState([]);
  const containerRef = useRef(null);

  // fecha se clica fora
  useEffect(() => {
    function handleClickFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // carrega itens da refeição atual do JSON
  useEffect(() => {
    async function carregarAlimentos() {
      try {
        const response = await fetch("/dados.json"); // pega do public, mas tu vai trocar pela API
        const data = await response.json();
        const listaAtual = data[currentMealList]?.items || [];
        setItensAdicionados(listaAtual);
      } catch (err) {
        console.error("Erro ao carregar alimentos:", err);
        setItensAdicionados([]);
      }
    }

    carregarAlimentos();
  }, [currentMealList]);

  // busca ingredientes na API externa
  async function buscarIngredientes(termo) {
    setTermoPesquisa(termo);

    if (termo.length < 2) {
      setSugestoes([]);
      return;
    }

    const apiKey = "617d584fd753442483088b758ccd52fd";
    const url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
      termo
    )}&number=10&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setSugestoes(data.results || []);
    } catch (error) {
      console.error("Erro na API:", error);
      setSugestoes([]);
    }
  }

  // adiciona item novo na lista local
  function adicionarItem(item) {
    if (loadingId) return;
    setLoadingId(item.id);
    document.body.style.cursor = "wait";

    const novoItem = {
      id: Date.now(), // id único
      nome: item.name,
      especificacao: 100,
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
    };

    setItensAdicionados((prev) => [...prev, novoItem]);
    setLoadingId(null);
    setDropdownAberto(false);
    document.body.style.cursor = "default";
  }

  return (
    <div className="modalalimento show">
      <div className="modalalm-content">
        <div className="addalm">
          <h4>Adicionar alimentos</h4>
        </div>

        <div className="psqsalm">
          <div className="campo" ref={containerRef}>
            <input
              className="inmputmodal"
              placeholder="Pesquisar alimento..."
              value={termoPesquisa}
              onChange={(e) => {
                buscarIngredientes(e.target.value);
                setDropdownAberto(true);
              }}
              onFocus={() => setDropdownAberto(true)}
            />

            {dropdownAberto && sugestoes.length > 0 && (
              <div
                className="sugestao-container"
                onMouseDown={(e) => e.preventDefault()}
              >
                {sugestoes.map((item, index) => (
                  <div
                    key={index}
                    className={`sugestao-item ${
                      loadingId === item.id ? "loading" : ""
                    }`}
                    onClick={() => adicionarItem(item)}
                  >
                    {index + 1}. {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="almadd existing-items">
          {itensAdicionados.length === 0 && (
            <div className="no-items">Nenhum alimento adicionado ainda</div>
          )}

          {itensAdicionados.map((item) => (
            <div
              key={item.id}
              className="itemadd"
              onClick={() => abrirModalDetalhes(currentMealList, item.id)}
            >
              <div className="nm">
                <h1>{item.nome}</h1>
                <h2>{item.calorias || 0} cal</h2>
              </div>
              <div className="gm">
                <h1>{item.especificacao || 0} g/ml</h1>
              </div>
            </div>
          ))}

          <div className="addalmbtn">
            <button className="mdlcl" onClick={fechar}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
