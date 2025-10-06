import { useState, useEffect, useRef } from "react";
import "./style.css";
import { 
  buscarAlimentos, 
  addAlimento, 
  listarAlimentosRefeicao, // Removido se não for usado
  criarRefeicao,
  listarRefeicoes
} from "../../services/Alimentos/alimentos";

export default function ModalAdd({ fechar, currentMealList, abrirModalDetalhes, onUpdate }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [itensAdicionados, setItensAdicionados] = useState([]);
  const [idRefeicaoAtual, setIdRefeicaoAtual] = useState(null);
  const [erro, setErro] = useState(null);
  const containerRef = useRef(null);

  // Mapear nomes internos para nomes de refeição
  const mapearNomeRefeicao = (nomeInterno) => {
    const mapeamento = {
      'cafe': 'Café da manhã',
      'almoco': 'Almoço', 
      'janta': 'Jantar',
      'outros': 'Outros'
    };
    return mapeamento[nomeInterno] || nomeInterno;
  };

  // Função para carregar itens - DEFINIDA
  const carregarItensAdicionados = async (idRefeicao) => {
    try {
      const response = await listarAlimentosRefeicao(idRefeicao);
      if (response.success) {
        setItensAdicionados(response.alimentos || []);
      }
    } catch (err) {
      console.error("Erro ao carregar alimentos adicionados:", err);
      setItensAdicionados([]);
    }
  };

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

  // Inicializar ou buscar refeição atual
  useEffect(() => {
    const inicializarRefeicao = async () => {
      setErro(null);
      try {
        const nomeRefeicaoMapeado = mapearNomeRefeicao(currentMealList);
        console.log("Buscando refeição existente:", nomeRefeicaoMapeado);
        
        // PRIMEIRO busca refeições existentes
        const response = await listarRefeicoes();
        console.log("Refeições encontradas:", response.refeicoes);
        
        if (response.success && response.refeicoes) {
          const hoje = new Date().toISOString().split('T')[0]; // Data de hoje YYYY-MM-DD
          const refeicaoExistente = response.refeicoes.find(ref => {
            const dataRef = ref.data_ref ? ref.data_ref.split(' ')[0] : ''; // Pega apenas a data
            return ref.nome_tipo === nomeRefeicaoMapeado && dataRef === hoje;
          });
          
          if (refeicaoExistente) {
            console.log("Refeição existente encontrada:", refeicaoExistente);
            setIdRefeicaoAtual(refeicaoExistente.id);
            await carregarItensAdicionados(refeicaoExistente.id);
            return;
          }
        }
        
        // Se não encontrou, cria nova refeição
        console.log("Criando nova refeição:", nomeRefeicaoMapeado);
        const criarResponse = await criarRefeicao(nomeRefeicaoMapeado);
        
        if (criarResponse.success && criarResponse.id_refeicao) {
          setIdRefeicaoAtual(criarResponse.id_refeicao);
          await carregarItensAdicionados(criarResponse.id_refeicao);
        } else {
          throw new Error(criarResponse.error || 'Erro ao criar refeição');
        }
        
      } catch (error) {
        console.error("Erro ao inicializar refeição:", error);
        setErro(`Erro: ${error.message}`);
      }
    };

    if (currentMealList) {
      inicializarRefeicao();
    }
  }, [currentMealList]);

  // busca ingredientes na API externa
  const buscarSugestoes = async (termo) => {
    setTermoPesquisa(termo);

    if (termo.length < 2) {
      setSugestoes([]);
      return;
    }

    try {
      const data = await buscarAlimentos(termo);
      if (data.success && data.resultados) {
        setSugestoes(data.resultados);
      } else {
        setSugestoes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões de alimentos:", error);
      setSugestoes([]);
    }
  };

  // adiciona item novo na lista local e no backend
  const handleAddItem = async (item) => {
    if (loadingId || !idRefeicaoAtual) {
      alert("Refeição não está pronta. Aguarde...");
      return;
    }
    
    setLoadingId(item.id);
    document.body.style.cursor = "wait";

    try {
      const novoAlimento = {
        id_tipo_refeicao: idRefeicaoAtual,
        nome: item.nome || item.name,
        quantidade: 100,
        medida: 'g'
      };

      await addAlimento(novoAlimento);
      await carregarItensAdicionados(idRefeicaoAtual);
      
      if (onUpdate) {
        onUpdate();
      }
      
      setLoadingId(null);
      setDropdownAberto(false);
      setTermoPesquisa("");
      document.body.style.cursor = "default";
    } catch (error) {
      console.error("Erro ao adicionar alimento:", error);
      alert(`Erro ao adicionar alimento: ${error.message}`);
      setLoadingId(null);
      document.body.style.cursor = "default";
    }
  };

  const nomeExibicao = mapearNomeRefeicao(currentMealList);

  return (
    <div className="modalalimento show">
      <div className="modalalm-content">
        <div className="addalm">
          <h4 className="h4modal">Adicionar alimentos - {nomeExibicao}</h4>
          {idRefeicaoAtual && <p style={{color: 'green', fontSize: '12px'}}>Refeição ID: {idRefeicaoAtual}</p>}
          {erro && <p style={{color: 'red', fontSize: '12px'}}>{erro}</p>}
        </div>

        <div className="psqsalm">
          <div className="campo" ref={containerRef}>
            <input
              className="inmputmodal"
              placeholder="Pesquisar alimento..."
              value={termoPesquisa}
              onChange={(e) => {
                buscarSugestoes(e.target.value);
                setDropdownAberto(true);
              }}
              onFocus={() => setDropdownAberto(true)}
              disabled={!idRefeicaoAtual}
            />

            {dropdownAberto && sugestoes.length > 0 && (
              <div
                className="sugestao-container"
                onMouseDown={(e) => e.preventDefault()}
              >
                {sugestoes.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`sugestao-item ${
                      loadingId === item.id ? "loading" : ""
                    }`}
                    onClick={() => handleAddItem(item)}
                  >
                    {index + 1}. {item.nome}
                    {item.nome_original && ` (${item.nome_original})`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="almadd existing-items">
          {!idRefeicaoAtual ? (
            <div className="no-items">Carregando refeição...</div>
          ) : itensAdicionados.length === 0 ? (
            <div className="no-items">Nenhum alimento adicionado ainda</div>
          ) : (
            itensAdicionados.map((item) => (
              <div
                key={item.idItensRef}
                className="itemadd"
                onClick={() => abrirModalDetalhes(currentMealList, item)}
              >
                <div className="nm">
                  <h1>{item.nome}</h1>
                  <h2>{item.calorias || 0} cal</h2>
                </div>
                <div className="gm">
                  <h1>{item.quantidade || 0} {item.medida || 'g'}</h1>
                </div>
              </div>
            ))
          )}

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