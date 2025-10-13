import { useState, useRef, useEffect } from "react";
import alimentosService from "../../services/Alimentos/alimentosService";
import { FaSearch } from "react-icons/fa";

const SearchWithButton = ({
  onSearch,
  placeholder = "Pesquisar alimento...",
}) => {
  const [termo, setTermo] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const containerRef = useRef(null);

  // Fecha dropdown se clicar fora
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

  // Busca sugestões quando o usuário clica na lupa
  const handleBuscar = async () => {
    if (termo.length < 2) {
      setSugestoes([]);
      setBuscaRealizada(false); // Reseta o estado
      alert("Digite pelo menos 2 caracteres para buscar");
      return;
    }

    setCarregando(true);
    setBuscaRealizada(false); // Reseta antes da nova busca

    try {
      console.log("🔍 Buscando alimentos:", termo);
      const data = await alimentosService.buscarAlimentos(termo);

      if (data.success && data.resultados) {
        setSugestoes(data.resultados);
        setDropdownAberto(true); // Abre o dropdown apenas quando tem resultados
        setBuscaRealizada(true); // Marca que a busca foi realizada
        console.log(`✅ ${data.resultados.length} sugestões encontradas`);
      } else {
        setSugestoes([]);
        setDropdownAberto(true); // Abre o dropdown mesmo sem resultados
        setBuscaRealizada(true); // Marca que a busca foi realizada
        console.log("❌ Nenhuma sugestão encontrada");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar sugestões:", error);
      setSugestoes([]);
      setDropdownAberto(true); // Abre o dropdown para mostrar erro
      setBuscaRealizada(true); // Marca que a busca foi realizada
    } finally {
      setCarregando(false);
    }
  };

  // Enter também dispara a busca
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleBuscar();
    }
  };

  // Quando seleciona um item da lista
  const handleSelectItem = (item) => {
    if (onSearch) {
      onSearch(item);
    }
    setDropdownAberto(false);
    setTermo("");
    setSugestoes([]);
    setBuscaRealizada(false); // Reseta o estado após seleção
  };

  return (
    <div className="SearchWithButton" ref={containerRef}>
      <div
        className="input-group"
        style={{ display: "flex", gap: "10px", alignItems: "center" }}
      >
        <input
          className="inmputmodal"
          placeholder={placeholder}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyPress={handleKeyPress}
          // Remove o onFocus que abria o dropdown automaticamente
          style={{ flex: 1 }}
        />

        <button
          onClick={handleBuscar}
          disabled={carregando || termo.length < 2}
          className="btn-lupa"
        >
          {carregando ? "Buscando..." : <FaSearch size={25}/>}
        </button>
      </div>

      {/* Dropdown de sugestões - APENAS quando busca foi realizada */}
      {dropdownAberto && buscaRealizada && (
        <div className="sugestao-container">
          {carregando ? (
            <div
              className="sugestao-item"
              style={{ color: "#888", textAlign: "center" }}
            >
              ⏳ Buscando alimentos...
            </div>
          ) : sugestoes.length > 0 ? (
            sugestoes.map((item, index) => (
              <div
                key={item.id || index}
                className="sugestao-item"
                onClick={() => handleSelectItem(item)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {index + 1}. {item.nome}
                    {item.nome_original && item.nome_original !== item.nome && (
                      <span
                        style={{
                          fontSize: "0.8em",
                          color: "#888",
                          marginLeft: "8px",
                        }}
                      >
                        ({item.nome_original})
                      </span>
                    )}
                  </span>
                  {item.imagem && (
                    <img
                      src={item.imagem}
                      alt={item.nome}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "4px",
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              className="sugestao-item"
              style={{ color: "#888", textAlign: "center" }}
            >
              Nenhum alimento encontrado para "{termo}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWithButton;
