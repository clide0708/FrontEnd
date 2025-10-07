import { useState, useRef, useEffect } from 'react';
import alimentosService from '../../services/Alimentos/alimentosService';

const SearchWithButton = ({ onSearch, placeholder = "Pesquisar alimento..." }) => {
  const [termo, setTermo] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const containerRef = useRef(null);

  // Fecha dropdown se clicar fora
  useEffect(() => {
    function handleClickFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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
      alert("Digite pelo menos 2 caracteres para buscar");
      return;
    }

    setCarregando(true);
    setDropdownAberto(true);

    try {
      console.log("🔍 Buscando alimentos:", termo);
      const data = await alimentosService.buscarAlimentos(termo);
      
      if (data.success && data.resultados) {
        setSugestoes(data.resultados);
        console.log(`✅ ${data.resultados.length} sugestões encontradas`);
      } else {
        setSugestoes([]);
        console.log("❌ Nenhuma sugestão encontrada");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar sugestões:", error);
      setSugestoes([]);
    } finally {
      setCarregando(false);
    }
  };

  // Enter também dispara a busca
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
  };

  return (
    <div className="campo-com-lupa" ref={containerRef}>
      <div className="input-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          className="inmputmodal"
          placeholder={placeholder}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setDropdownAberto(true)}
          style={{ flex: 1 }}
        />
        
        <button
          onClick={handleBuscar}
          disabled={carregando || termo.length < 2}
          className="btn-lupa"
          style={{
            background: '#368dd9',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: termo.length < 2 ? 'not-allowed' : 'pointer',
            opacity: termo.length < 2 ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {carregando ? '⏳' : '🔍'}
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Dropdown de sugestões */}
      {dropdownAberto && (
        <div className="sugestao-container">
          {carregando ? (
            <div className="sugestao-item" style={{ color: '#888', textAlign: 'center' }}>
              ⏳ Buscando alimentos...
            </div>
          ) : sugestoes.length > 0 ? (
            sugestoes.map((item, index) => (
              <div
                key={item.id || index}
                className="sugestao-item"
                onClick={() => handleSelectItem(item)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {index + 1}. {item.nome}
                    {item.nome_original && item.nome_original !== item.nome && (
                      <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '8px' }}>
                        ({item.nome_original})
                      </span>
                    )}
                  </span>
                  {item.imagem && (
                    <img 
                      src={item.imagem} 
                      alt={item.nome}
                      style={{ width: '30px', height: '30px', borderRadius: '4px' }}
                    />
                  )}
                </div>
              </div>
            ))
          ) : termo.length >= 2 ? (
            <div className="sugestao-item" style={{ color: '#888', textAlign: 'center' }}>
              Nenhum alimento encontrado para "{termo}"
            </div>
          ) : (
            <div className="sugestao-item" style={{ color: '#888', textAlign: 'center' }}>
              Digite pelo menos 2 caracteres e clique em Buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWithButton;