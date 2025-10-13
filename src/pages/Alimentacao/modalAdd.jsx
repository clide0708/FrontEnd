import { useState, useEffect } from "react";
import "./style.css";
import alimentosService from "../../services/Alimentos/alimentosService";
import SearchWithButton from "./SearchWithButton";

export default function ModalAdd({ fechar, currentMealList, abrirModalDetalhes, onUpdate, criarRefeicao }) {
  const [itensAdicionados, setItensAdicionados] = useState([]);
  const [idRefeicaoAtual, setIdRefeicaoAtual] = useState(null);
  const [, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [modoCriacao, setModoCriacao] = useState(!currentMealList);

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

  // ✅ CORREÇÃO: Função para obter data atual formatada
  const obterDataAtualFormatada = () => {
    const agora = new Date();
    const offset = -3; // UTC-3 para Brasília
    const localTime = new Date(agora.getTime() + (offset * 60 * 60 * 1000));
    
    const ano = localTime.getUTCFullYear();
    const mes = String(localTime.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(localTime.getUTCDate()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}`;
  };

  // Função para carregar itens
  const carregarItensAdicionados = async (idRefeicao) => {
    try {
      const response = await alimentosService.listarAlimentosRefeicao(idRefeicao);
      if (response.success) {
        setItensAdicionados(response.alimentos || []);
      }
    } catch (err) {
      console.error("Erro ao carregar alimentos adicionados:", err);
      setItensAdicionados([]);
    }
  };

  // Inicializar ou buscar refeição atual
  useEffect(() => {
    const inicializarRefeicao = async () => {
      setErro(null);
      setCarregando(true);
      
      try {
        // Se está no modo criação, não inicializa refeição específica
        if (modoCriacao) {
          console.log("📝 Modo criação de nova refeição");
          setItensAdicionados([]);
          setCarregando(false);
          return;
        }

        const nomeRefeicaoMapeado = mapearNomeRefeicao(currentMealList);
        console.log("🔄 Inicializando refeição:", nomeRefeicaoMapeado);
        
        // Busca refeições existentes
        const response = await alimentosService.listarRefeicoesHoje();
        console.log("📋 Refêições encontradas:", response.refeicoes);
        
        if (response.success && response.refeicoes) {
          // ✅ CORREÇÃO: Usar data atual formatada corretamente
          const hoje = obterDataAtualFormatada();
          console.log("📅 Buscando refeições para a data:", hoje);
          
          const refeicaoExistente = response.refeicoes.find(ref => {
            const dataRef = ref.data_ref ? ref.data_ref.split(' ')[0] : '';
            console.log(`🔍 Comparando: ${dataRef} === ${hoje} para ${ref.nome_tipo}`);
            return ref.nome_tipo === nomeRefeicaoMapeado && dataRef === hoje;
          });
          
          if (refeicaoExistente) {
            console.log("✅ Refêição existente encontrada:", refeicaoExistente);
            setIdRefeicaoAtual(refeicaoExistente.id);
            await carregarItensAdicionados(refeicaoExistente.id);
          } else {
            // Cria nova refeição se não existir
            console.log("🆕 Criando nova refeição:", nomeRefeicaoMapeado);
            const criarResponse = await criarRefeicao(nomeRefeicaoMapeado);
            
            if (criarResponse.id_refeicao) {
              setIdRefeicaoAtual(criarResponse.id_refeicao);
              console.log("✅ Nova refeição criada com ID:", criarResponse.id_refeicao);
            } else {
              throw new Error(criarResponse.error || 'Erro ao criar refeição');
            }
          }
        }
        
      } catch (error) {
        console.error("❌ Erro ao inicializar refeição:", error);
        setErro(`Erro: ${error.message}`);
      } finally {
        setCarregando(false);
      }
    };

    if (!modoCriacao) {
      inicializarRefeicao();
    }
  }, [currentMealList, criarRefeicao, modoCriacao]);

  // Adiciona item novo na lista
  const handleAddItem = async (item) => {
    if (!idRefeicaoAtual) {
      alert("Refeição não está pronta. Aguarde...");
      return;
    }

    try {
      console.log("➕ Adicionando alimento:", item.nome);
      
      const novoAlimento = {
        id_tipo_refeicao: idRefeicaoAtual,
        nome: item.nome || item.name,
        quantidade: 100,
        medida: 'g'
      };

      const response = await alimentosService.addAlimento(novoAlimento);
      
      if (response.success) {
        console.log("✅ Alimento adicionado com sucesso");
        
        // Recarrega os itens atualizados
        await carregarItensAdicionados(idRefeicaoAtual);
        
        // Notifica o componente pai para atualizar totais
        if (onUpdate) {
          onUpdate();
        }
      } else {
        throw new Error(response.error || 'Erro ao adicionar alimento');
      }
      
    } catch (error) {
      console.error("❌ Erro ao adicionar alimento:", error);
      alert(`Erro ao adicionar alimento: ${error.message}`);
    }
  };

  // Handler para criar nova refeição
  const handleCriarNovaRefeicao = async (nomeRefeicao) => {
    try {
      setCarregando(true);
      setErro(null);
      
      console.log("🆕 Tentando criar refeição:", nomeRefeicao);
      
      const response = await criarRefeicao(nomeRefeicao);
      
      if (response.success && response.id_refeicao) {
        console.log("✅ Nova refeição criada:", nomeRefeicao, "ID:", response.id_refeicao);
        
        // ✅ CORREÇÃO: Mostrar debug da data
        console.log("📅 Data da criação:", new Date().toLocaleString('pt-BR'));
        
        // Fecha o modal imediatamente
        fechar();
        
      } else {
        throw new Error(response.error || 'Erro desconhecido ao criar refeição');
      }
    } catch (error) {
      console.error("❌ Erro ao criar refeição:", error);
      
      if (error.message.includes('já existe') || error.message.includes('duplicat')) {
        setErro(`A refeição "${nomeRefeicao}" já existe para hoje. Use "Adicionar a Refeição Existente".`);
      } else {
        setErro(`Erro: ${error.message}`);
      }
    } finally {
      setCarregando(false);
    }
  };


  // Handler para adicionar a refeição existente - VERSÃO CORRIGIDA
  const handleAdicionarARefeicaoExistente = async (nomeRefeicao) => {
    try {
      setCarregando(true);
      setErro(null);
      
      console.log("🔍 Buscando refeição existente:", nomeRefeicao);
      
      // Busca a refeição existente
      const response = await alimentosService.listarRefeicoesHoje();
      
      if (response.success && response.refeicoes) {
        const refeicaoExistente = response.refeicoes.find(ref => 
          ref.nome_tipo === nomeRefeicao
        );
        
        if (refeicaoExistente) {
          console.log("✅ Refeição existente encontrada:", refeicaoExistente);
          setIdRefeicaoAtual(refeicaoExistente.id);
          setModoCriacao(false);
          await carregarItensAdicionados(refeicaoExistente.id);
        } else {
          // Se não existe, pergunta se quer criar
          const confirmar = window.confirm(
            `Refeição "${nomeRefeicao}" não encontrada. Deseja criá-la?`
          );
          
          if (confirmar) {
            await handleCriarNovaRefeicao(nomeRefeicao);
          }
        }
      } else {
        throw new Error('Erro ao buscar refeições existentes');
      }
    } catch (error) {
      console.error("❌ Erro ao buscar refeição existente:", error);
      setErro(`Erro: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  // Handler para forçar criação de refeição (ignora duplicação)
  // const handleForcarCriarRefeicao = async (nomeRefeicao) => {
  //   try {
  //     setCarregando(true);
  //     setErro(null);
      
  //     console.log("💪 Forçando criação de refeição:", nomeRefeicao);
      
  //     // CORREÇÃO: Adiciona timestamp único para evitar conflitos
  //     const dataUnica = new Date().toISOString();
  //     const nomeUnico = `${nomeRefeicao} - ${new Date().getTime()}`;
      
  //     const response = await criarRefeicao(nomeUnico, dataUnica);
      
  //     if (response.id_refeicao) {
  //       setIdRefeicaoAtual(response.id_refeicao);
  //       setModoCriacao(false);
  //       console.log("✅ Refeição forçada criada:", nomeUnico, "ID:", response.id_refeicao);
        
  //       if (onUpdate) {
  //         onUpdate();
  //       }
  //     }
  //   } catch (error) {
  //     console.error("❌ Erro ao forçar criação:", error);
  //     setErro(`Erro crítico: ${error.message}`);
  //   } finally {
  //     setCarregando(false);
  //   }
  // };
  const [modo, setModo] = useState(
    currentMealList === "" ? "selecao" : 
    currentMealList === "nova" ? "criacao" : 
    currentMealList === "existente" ? "adicao" : 
    "especifico"
  );

  const voltarParaSelecao = () => {
    setModo("selecao");
    setIdRefeicaoAtual(null);
    setItensAdicionados([]);
  };

  const nomeExibicao = modoCriacao ? 'Adicionar Refeição' : mapearNomeRefeicao(currentMealList);

  return (
    <div className="modalAdd show">
      <div className="modalalm-content">
        <div className="addalm">
          <h4 className="h4modal">
            {modo === "selecao" && "Criar/Adicionar Refeição"}
            {modo === "criacao" && "Criar Nova Refeição"}
            {modo === "adicao" && "Adicionar Alimentos a Refeição Existente"}
            {modo === "especifico" && mapearNomeRefeicao(currentMealList)}
          </h4>
          
          {/* Botão voltar quando não está no modo seleção */}
          {modo !== "selecao" && (
            <button 
              onClick={voltarParaSelecao}
              style={{
                background: 'transparent',
                color: '#368dd9',
                border: '1px solid #368dd9',
                padding: '5px 10px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.8em',
                marginLeft: '10px',
                margin: '15px'
              }}
            >
              ← Voltar
            </button>
          )}
        </div>

        {/* MODO SELEÇÃO - Aparece quando currentMealList está vazio ou "nova" ou "existente" */}
        {modo === "selecao" && (
          <div className="gerenciar-refeicoes-section" style={{marginBottom: '20px'}}>
            
            <div className="opcoes-refeicao" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              
              {/* Opção 1: Criar nova refeição */}
              <div className="opcao-criar">
                <div className="botoes-refeicao" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  {['Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Café da Tarde', 'Pré-treino', 'Pós-treino'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => handleCriarNovaRefeicao(tipo)}
                      disabled={carregando}
                    >
                      + {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opção 2: Adicionar a refeição existente */}
            </div>
          </div>
        )}

        {/* MODO CRIAÇÃO - Aparece quando vem do botão "Nova Refeição" */}
        {modo === "criacao" && (
          <div className="modo-criacao-section" style={{marginBottom: '20px'}}>
            <h5 style={{color: '#fff', marginBottom: '15px'}}>Criar Nova Refeição</h5>
            <div className="botoes-refeicao" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {['Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Café da Tarde', 'Pré-treino', 'Pós-treino'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => handleCriarNovaRefeicao(tipo)}
                  disabled={carregando}
                  style={{
                    padding: '8px 16px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: carregando ? 'not-allowed' : 'pointer',
                    opacity: carregando ? 0.6 : 1,
                    fontSize: '0.9em'
                  }}
                >
                  + {tipo}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODO ADIÇÃO - Aparece quando vem do botão "+" dentro de uma refeição */}
        {modo === "adicao" && (
          <div className="modo-adicao-section" style={{marginBottom: '20px'}}>
            {/* <h5 style={{color: '#fff', marginBottom: '15px'}}>Adicionar Alimentos a Refeição Existente</h5> */}
            <div className="botoes-refeicao" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {['Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Café da Tarde', 'Pré-treino', 'Pós-treino'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => handleAdicionarARefeicaoExistente(tipo)}
                  disabled={carregando}
                  style={{
                    padding: '8px 16px',
                    background: '#f39c12',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: carregando ? 'not-allowed' : 'pointer',
                    opacity: carregando ? 0.6 : 1,
                    fontSize: '0.9em'
                  }}
                >
                  ➕ {tipo}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Seção de pesquisa (só aparece se há refeição atual) */}
        {idRefeicaoAtual && (
          <div className="psqsalm">
            <SearchWithButton
              onSearch={handleAddItem}
              placeholder="Pesquisar alimento (digite e clique em Buscar)..."
            />
          </div>
        )}

        {/* Lista de alimentos adicionados */}
        <div className="almadd existing-items">
          {/* <h5 style={{color: '#fff', marginBottom: '10px'}}>
            {idRefeicaoAtual ? `Alimentos adicionados (${itensAdicionados.length})` : 'Nenhuma refeição selecionada'}
          </h5>
          
          {!idRefeicaoAtual ? (
            <div className="no-items" style={{textAlign: 'center', padding: '20px', color: '#aaa'}}>
              {carregando ? 'Carregando...' : 'Selecione ou crie uma refeição acima'}
            </div>
          ) : itensAdicionados.length === 0 ? (
            <div className="no-items" style={{textAlign: 'center', padding: '20px', color: '#aaa'}}>
              Nenhum alimento adicionado ainda
              <br />
              <small>Use a pesquisa acima para adicionar alimentos</small>
            </div>
          ) : (
            itensAdicionados.map((item) => (
              <div
                key={item.idItensRef}
                className="itemadd"
                onClick={() => abrirModalDetalhes({nome_tipo: nomeExibicao}, item)}
                style={{cursor: 'pointer'}}
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
          )} */}

          <div className="addalmbtn">
            <button 
              className="mdlcl" 
              onClick={fechar}
            >
              Confirmar
            </button>
            
            {idRefeicaoAtual && (
              <div style={{fontSize: '0.8em', color: '#aaa'}}>
                {itensAdicionados.length} itens
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}