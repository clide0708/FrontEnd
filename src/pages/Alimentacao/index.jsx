import { useState, useEffect, useCallback } from "react";
import ModalAdd from "./modalAdd";
import ModalDetalhes from "./modalDetalhes";
import "./style.css";
import { calcularIMC, calcularIDR, consumoAgua } from "../../utils/calculos";
import { obterUsuario } from "../../services/Auth/login";
import alimentosService from "../../services/Alimentos/alimentosService";

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

  const [refeicoes, setRefeicoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [modalAdd, setModalAdd] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [currentMealList, setCurrentMealList] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [cardAberto, setCardAberto] = useState("");

  // ✅ CORREÇÃO: Data de hoje formatada corretamente
  useEffect(() => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    // const ano = hoje.getFullYear();
    
    // Mostrar data completa para debug
    console.log("📅 Data atual do sistema:", hoje.toLocaleString('pt-BR'));
    console.log("📆 Data formatada para exibição:", `${dia}/${mes}`);
    
    setDataHoje(`${dia}/${mes}`);
  }, []);

  // Carregar refeições
  const carregarRefeicoes = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      console.log("🔄 Carregando refeições...");
      const response = await alimentosService.listarRefeicoesHoje();
      
      if (response && response.success) {
        setRefeicoes(response.refeicoes || []);
        console.log("✅ Refêições carregadas:", response.refeicoes?.length || 0);
      } else {
        throw new Error(response?.error || 'Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar refeições:', error);
      setErro(error.message);
      setRefeicoes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  const excluirRefeicao = async (idRefeicao, nomeRefeicao) => {
    if (!window.confirm(`Tem certeza que deseja excluir a refeição "${nomeRefeicao}"?`)) {
      return;
    }

    try {
      console.log("🗑️ Excluindo refeição:", idRefeicao);
      
      // Você precisará criar este método no alimentosService
      const response = await alimentosService.removerRefeicao(idRefeicao);
      
      if (response.success) {
        console.log("✅ Refeição excluída com sucesso");
        carregarRefeicoes(); // Recarrega a lista
      } else {
        throw new Error(response.error || 'Erro ao excluir refeição');
      }
    } catch (error) {
      console.error("❌ Erro ao excluir refeição:", error);
      alert(`Erro ao excluir refeição: ${error.message}`);
    }
  };

  // Carregar usuário
  const carregarUsuario = useCallback(async () => {
    try {
      const data = await obterUsuario();
      const genero = data.genero?.toLowerCase() === "masculino" ? "Masculino" : "Feminino";
      const treino = data.treino ? data.treino.charAt(0).toUpperCase() + data.treino.slice(1).toLowerCase() : "";
      
      setUser({
        nome: data.nome || "",
        idade: Number(data.idade) || 0,
        peso: Number(data.peso) || 0,
        altura: Number(data.altura) || 0,
        genero: genero,
        treino: treino,
        meta: Number(data.meta) || 0,
        img: data.img && data.img.startsWith("/") ? data.img : data.img ? "/" + data.img : "",
      });
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
    }
  }, []);

  // Criar refeição
  const criarRefeicao = async (nomeTipo, dataRef = null) => {
    try {
      console.log("🍽️ Criando refeição:", nomeTipo);
      
      const response = await alimentosService.criarRefeicao(nomeTipo, dataRef);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar refeição');
      }
      
      console.log("✅ Refeição criada com ID:", response.id_refeicao);
      
      // CORREÇÃO: Aguarda um pouco e depois recarrega as refeições
      setTimeout(() => {
        carregarRefeicoes(); // Isso deve atualizar o estado `refeicoes`
      }, 1000);
      
      return response;
    } catch (error) {
      console.error("❌ Erro ao criar refeição:", error);
      setErro(error.message);
      throw error;
    }
  };

  // Efeitos iniciais
  useEffect(() => {
    console.log("🎯 Inicializando componente Alimentacao");
    carregarRefeicoes();
    carregarUsuario();
  }, [carregarRefeicoes, carregarUsuario]);

  useEffect(() => {
    console.log("📊 Estado refeicoes atualizado:", refeicoes);
  }, [refeicoes]);

  // Calcular totais
  const calcularTotais = () => {
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;

    refeicoes.forEach(refeicao => {
      totalCalorias += refeicao.totais?.calorias || 0;
      totalProteinas += refeicao.totais?.proteinas || 0;
      totalCarboidratos += refeicao.totais?.carboidratos || 0;
      totalGorduras += refeicao.totais?.gorduras || 0;
    });

    return { totalCalorias, totalProteinas, totalCarboidratos, totalGorduras };
  };

  const totais = calcularTotais();
  const calRes = () => Math.max(user.meta - totais.totalCalorias, 0);

  const calcularTotaisRefeicao = (refeicao) => {
    if (refeicao.totais) {
      return refeicao.totais;
    }
    
    // Calcula manualmente se não vier do backend
    let calorias = 0;
    let proteinas = 0;
    let carboidratos = 0;
    let gorduras = 0;
    
    (refeicao.alimentos || []).forEach(alimento => {
      calorias += parseFloat(alimento.calorias || 0);
      proteinas += parseFloat(alimento.proteinas || 0);
      carboidratos += parseFloat(alimento.carboidratos || 0);
      gorduras += parseFloat(alimento.gorduras || 0);
    });
    
    return {
      calorias: Math.round(calorias),
      proteinas: Math.round(proteinas),
      carboidratos: Math.round(carboidratos),
      gorduras: Math.round(gorduras)
    };
  };

  // Handlers para modais
  const abrirModalDetalhes = (refeicao, item) => {
    setCurrentMealList(refeicao.nome_tipo);
    setCurrentItem(item);
    setModalDetalhes(true);
  };

  const toggleCard = (refeicaoId) => {
    setCardAberto(prev => prev === refeicaoId ? "" : refeicaoId);
  };

  if (carregando) {
    return (
      <div className="alimentacao">
        <div className="container">
          <div className="loading-message">Carregando suas refeições...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="alimentacao">
      <div className="container">
        <div className="geral">
          {/* Seção de Alimentação */}
          <div className="alim-content">
            <div className="pt1">
              <div className="heading-section">
                <h4 className="data">{dataHoje}</h4>
                {/* ✅ DEBUG: Mostrar data completa */}
                <small style={{color: '#666', fontSize: '0.7em'}}>
                  {new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR')}
                </small>
              </div>
              <div className="caltotal">
                <h1>Calorias</h1>
                <h1>{totais.totalCalorias.toFixed(0)}</h1>
              </div>
            </div>

            <div className="pt2">
              <h2>Prot - {totais.totalProteinas.toFixed(0)}g</h2>
              <h2>Carb - {totais.totalCarboidratos.toFixed(0)}g</h2>
              <h2>Gord - {totais.totalGorduras.toFixed(0)}g</h2>
            </div>

            {erro && (
              <div className="erro-message" style={{color: 'red', padding: '10px', background: '#ffebee', borderRadius: '5px', margin: '10px 0'}}>
                {erro}
              </div>
            )}

            <div className="refeicoes">
              {refeicoes.map((refeicao) => {
                const isAtivo = cardAberto === refeicao.id;
                const tot = refeicao.totais || { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
                const items = refeicao.alimentos || [];

                return (
                  <div
                    key={refeicao.id}
                    className={`ref ${isAtivo ? "ativa" : ""}`}
                    onClick={() => toggleCard(refeicao.id)}
                  >
                    <div className="refln">
                      <h1>{refeicao.nome_tipo}</h1>
                      <h2>{calcularTotaisRefeicao(refeicao).calorias} Cal</h2>
                      

                      {/* Botão de excluir - posicionado no canto superior direito */}
                      <button
                        className="btn-excluir-refeicao"
                        onClick={(e) => {
                          e.stopPropagation();
                          excluirRefeicao(refeicao.id, refeicao.nome_tipo);
                        }}
                        title="Excluir refeição"
                      >
                        ×
                      </button>
                    </div>

                    <div className={`contalm ${isAtivo ? "" : "oculto"}`}>
                      <div className="tableheadref">
                        <h1>Prot - {tot.proteinas.toFixed(0)}g</h1>
                        <h1>Carb - {tot.carboidratos.toFixed(0)}g</h1>
                        <h1>Gord - {tot.gorduras.toFixed(0)}g</h1>
                      </div>
                      <div className="tablescrollref">
                        {items.map((item) => (
                          <table
                            key={item.idItensRef}
                            className="tableref"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalDetalhes(refeicao, item);
                            }}
                          >
                            <tbody>
                              <tr>
                                <td>{item.nome}</td>
                                <td>{item.quantidade} {item.medida}</td>
                              </tr>
                            </tbody>
                          </table>
                        ))}
                      </div>
                      <div className="btns">
                        {/* BOTÃO ATUALIZADO - STRING VAZIA */}
                        <button
                          type="button"
                          className="add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentMealList(refeicao.nome_tipo); // ← AGORA MANDA O NOME DA REFEIÇÃO ATUAL
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

              {/* Botão para adicionar nova refeição se não houver - ATUALIZADO */}
              {refeicoes.length === 0 && (
                <div className="no-refeicoes" style={{textAlign: 'center', padding: '20px', color: '#aaa'}}>
                  <p>Nenhuma refeição hoje</p>
                  {/* BOTÃO ATUALIZADO - STRING VAZIA */}
                  <button 
                    className="add-btn"
                    onClick={() => {
                      setCurrentMealList(""); // ← STRING VAZIA
                      setModalAdd(true);
                    }}
                    style={{margin: '10px auto'}}
                  >
                    +
                  </button>
                </div>
              )}

              {/* // Adicione temporariamente no seu JSX: */}
            {/* <button 
              onClick={() => {
                console.log("🔍 Estado atual:", { refeicoes, carregando, erro });
                carregarRefeicoes();
              }}
              style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              Debug
            </button> */}

              {/* BOTÃO ADICIONAL PARA CRIAR NOVA REFEIÇÃO (mesmo quando já tem refeições) */}
              {refeicoes.length > 0 && (
              <div className="nova-refeicao-section" style={{textAlign: 'center', padding: '15px', marginTop: '10px'}}>
                <button 
                  className="add-btn"
                  onClick={() => {
                    setCurrentMealList(""); // ← VOLTA A SER STRING VAZIA
                    setModalAdd(true);
                  }}
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '12px 48px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  <span style={{fontSize: '1.2em'}}>+</span>
                  Nova Refeição
                </button>
                <p style={{color: '#aaa', fontSize: '0.8em', marginTop: '8px'}}>
                  Adicione mais refeições ao seu dia
                </p>
              </div>
              )}
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
                </div>
              </div>
            </div>
          </div>

          {/* Seção do Perfil */}
          // Substitua a seção completa do .pfl-content por:
          <div className="pfl-content">
            <div className="heading-section">
              <h4 className="nmpfl">{user.nome}</h4>
            </div>

            <div className="pflaln">
              <div className="sts">
                <ul>
                  <li>Peso: <span>{user.peso > 0 ? user.peso + " kg" : "-"}</span></li>
                  <li>Altura: <span>{user.altura > 0 ? user.altura + " cm" : "-"}</span></li>
                  <li>Gênero: <span>{user.genero || "-"}</span></li>
                  <li>Treino: <span>{user.treino || "-"}</span></li>
                  <li>Meta: <span>{user.meta || "-"}</span></li>
                  <li>Idade: <span>{user.idade > 0 ? user.idade + " anos" : "-"}</span></li>
                </ul>
              </div>

              <div className="pflft">
                <img src={user.img || "/default-profile.png"} alt="Perfil" />
              </div>
            </div>

            <div className="pflidc">
              <ul>
                <li>
                  IDR:
                  <span>
                    {user.peso > 0 && user.altura > 0 && user.idade > 0
                      ? calcularIDR(user.peso, user.altura, user.idade, user.genero, user.treino)
                      : "-"}
                  </span>
                </li>
                <li>
                  IMC:
                  <span>
                    {user.peso > 0 && user.altura > 0
                      ? calcularIMC(user.peso, user.altura, user.genero)
                      : "-"}
                  </span>
                </li>
                <li>
                  Consumo de água ideal:
                  <span>{user.peso > 0 ? consumoAgua(user.peso) : "-"}</span>
                </li>
                <li>
                  Meta calórica:
                  <span>{user.meta > 0 ? user.meta + " kcal" : "-"}</span>
                </li>
                <li>
                  Calorias restantes:
                  <span>{user.meta > 0 ? calRes() + " kcal" : "-"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {modalAdd && (
        <ModalAdd
          fechar={() => setModalAdd(false)}
          currentMealList={currentMealList}
          abrirModalDetalhes={abrirModalDetalhes}
          onUpdate={carregarRefeicoes}
          criarRefeicao={criarRefeicao}
        />
      )}
      
      {modalDetalhes && currentItem && (
        <ModalDetalhes
          item={currentItem}
          fechar={() => setModalDetalhes(false)}
          onUpdate={carregarRefeicoes}
          onDelete={carregarRefeicoes}
        />
      )}
    </div>
  );
}

export default Alimentacao;