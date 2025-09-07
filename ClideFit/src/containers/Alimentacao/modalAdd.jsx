// ModalAdd.jsx
import { useState, useRef, useEffect } from "react";
import "./style.css";

export default function ModalAdd({
  fechar,
  currentMealList,
  abrirModalDetalhes,
}) {
  const [sugestoes, setSugestoes] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState("");

  const containerRef = useRef(null);

  // fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

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

  async function adicionarItem(item) {
    if (loadingId) return;
    setLoadingId(item.id);
    document.body.style.cursor = "wait";

    try {
      const response = await fetch("post.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          lista: currentMealList,
          nome: item.name,
          especificacao: 100,
        }),
      });

      if (!response.ok) throw new Error("Erro ao adicionar alimento.");

      const result = await response.json();

      if (result.success && result.id) {
        abrirModalDetalhes(currentMealList, result.id);
      } else {
        alert("Erro ao adicionar alimento.");
      }
    } catch (error) {
      console.error("Erro ao adicionar alimento:", error);
      alert("Erro ao adicionar alimento.");
    } finally {
      setLoadingId(null);
      document.body.style.cursor = "default";
      setDropdownAberto(false);
    }
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
          {/* renderiza os itens já adicionados aqui */}
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
