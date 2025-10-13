import { useState, useEffect, useCallback } from "react";
import ModalAdd from "./modalAdd";
import ModalDetalhes from "./modalDetalhes";
import "./style.css";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { VscDiffAdded } from "react-icons/vsc";
import {
  calcularIMC,
  calcularIDR,
  consumoAgua,
  pesoIdeal,
  gorduraCorporalEstimada,
  calcularMetaCalorica,
} from "../../utils/calculos";
import { obterUsuario } from "../../services/Auth/login";
import alimentosService from "../../services/Alimentos/alimentosService";
import perfilService from "../../services/Perfil/perfil";
import { FiTrash2 } from "react-icons/fi";

function Alimentacao() {
  const [dataHoje, setDataHoje] = useState("");
  const [user, setUser] = useState({
    nome: "",
    idade: 0,
    peso: 0,
    altura: 0,
    genero: "",
    treinoTipo: "",
    meta: "",
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

    console.log("📅 Data atual do sistema:", hoje.toLocaleString("pt-BR"));
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
        console.log(
          "✅ Refêições carregadas:",
          response.refeicoes?.length || 0
        );
      } else {
        throw new Error(response?.error || "Resposta inválida do servidor");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar refeições:", error);
      setErro(error.message);
      setRefeicoes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  // ✅ CORREÇÃO: Carregar usuário do perfil
  const carregarUsuario = useCallback(async () => {
    try {
      // Primeiro tenta obter o email do usuário logado
      const usuarioLogado = await obterUsuario();
      const email = usuarioLogado?.email;

      if (!email) {
        console.error("❌ Email do usuário não encontrado");
        return;
      }

      console.log("📧 Buscando perfil do email:", email);

      // Busca o perfil completo usando o serviço do perfil
      const data = await perfilService.getPerfil(email);

      if (data && data.success) {
        console.log("✅ Perfil carregado:", data.data);

        // Mapeia os dados do perfil para o formato esperado
        setUser({
          nome: data.data.nome || "",
          idade: Number(data.data.idade) || 0,
          peso: Number(data.data.peso) || 0,
          altura: Number(data.data.altura) || 0,
          genero: data.data.genero || "",
          treinoTipo: data.data.treinoTipo || "",
          meta: data.data.meta || "",
          img: data.data.foto_perfil || "",
        });
      } else {
        console.error("❌ Erro ao carregar perfil:", data?.error);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar usuário:", err);
    }
  }, []);

  // Criar refeição
  const criarRefeicao = async (nomeTipo, dataRef = null) => {
    try {
      console.log("🍽️ Criando refeição:", nomeTipo);

      const response = await alimentosService.criarRefeicao(nomeTipo, dataRef);

      if (!response.success) {
        throw new Error(response.error || "Erro ao criar refeição");
      }

      console.log("✅ Refeição criada com ID:", response.id_refeicao);

      setTimeout(() => {
        carregarRefeicoes();
      }, 1000);

      return response;
    } catch (error) {
      console.error("❌ Erro ao criar refeição:", error);
      setErro(error.message);
      throw error;
    }
  };

  // ✅ CORREÇÃO: Função para excluir refeição
  const excluirRefeicao = async (idRefeicao, nomeRefeicao) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir a refeição "${nomeRefeicao}"?`
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Excluindo refeição:", idRefeicao);

      const response = await alimentosService.removerRefeicao(idRefeicao);

      if (response.success) {
        console.log("✅ Refeição excluída com sucesso");
        carregarRefeicoes();
      } else {
        throw new Error(response.error || "Erro ao excluir refeição");
      }
    } catch (error) {
      console.error("❌ Erro ao excluir refeição:", error);
      alert(`Erro ao excluir refeição: ${error.message}`);
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

  // Calcular totais das refeições
  const calcularTotais = () => {
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;

    refeicoes.forEach((refeicao) => {
      totalCalorias += refeicao.totais?.calorias || 0;
      totalProteinas += refeicao.totais?.proteinas || 0;
      totalCarboidratos += refeicao.totais?.carboidratos || 0;
      totalGorduras += refeicao.totais?.gorduras || 0;
    });

    return {
      totalCalorias: Math.round(totalCalorias),
      totalProteinas: Math.round(totalProteinas),
      totalCarboidratos: Math.round(totalCarboidratos),
      totalGorduras: Math.round(totalGorduras),
    };
  };

  const totais = calcularTotais();

  // ✅ CORREÇÃO: Calcular meta calórica baseada no perfil do usuário
  const metaCalorica =
    user.peso > 0 && user.altura > 0 && user.idade > 0 && user.genero
      ? calcularMetaCalorica(
          user.peso,
          user.altura,
          user.idade,
          user.genero,
          user.treinoTipo,
          user.meta
        )
      : 0;

  // ✅ CORREÇÃO: Calorias restantes = Meta calórica - Calorias consumidas
  const caloriasRestantes = Math.max(metaCalorica - totais.totalCalorias, 0);

  // Adicione esta função antes do return
  const formatarValor = (valor, sufixo = "") => {
    if (!valor || valor === 0) return "-";
    return `${valor}${sufixo}`;
  };

  // ✅ CORREÇÃO: Função para calcular totais de uma refeição específica
  const calcularTotaisRefeicao = (refeicao) => {
    if (refeicao.totais) {
      return refeicao.totais;
    }

    // Calcula manualmente se não vier do backend
    let calorias = 0;
    let proteinas = 0;
    let carboidratos = 0;
    let gorduras = 0;

    (refeicao.alimentos || []).forEach((alimento) => {
      calorias += parseFloat(alimento.calorias || 0);
      proteinas += parseFloat(alimento.proteinas || 0);
      carboidratos += parseFloat(alimento.carboidratos || 0);
      gorduras += parseFloat(alimento.gorduras || 0);
    });

    return {
      calorias: Math.round(calorias),
      proteinas: Math.round(proteinas),
      carboidratos: Math.round(carboidratos),
      gorduras: Math.round(gorduras),
    };
  };

  // Handlers para modais
  const abrirModalDetalhes = (refeicao, item) => {
    setCurrentMealList(refeicao.nome_tipo);
    setCurrentItem(item);
    setModalDetalhes(true);
  };

  const toggleCard = (refeicaoId) => {
    setCardAberto((prev) => (prev === refeicaoId ? "" : refeicaoId));
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
              <div
                className="erro-message"
                style={{
                  color: "red",
                  padding: "10px",
                  background: "#ffebee",
                  borderRadius: "5px",
                  margin: "10px 0",
                }}
              >
                {erro}
              </div>
            )}

            <div className="refeicoes">
              {refeicoes.map((refeicao) => {
                const isAtivo = cardAberto === refeicao.id;
                const tot = calcularTotaisRefeicao(refeicao);
                const items = refeicao.alimentos || [];

                return (
                  <div
                    key={refeicao.id}
                    className={`ref ${isAtivo ? "ativa" : ""}`}
                    onClick={() => toggleCard(refeicao.id)}
                  >
                    <div className="refln">
                      <h1>{refeicao.nome_tipo}</h1>
                      <h2>{tot.calorias} Cal</h2>

                      {/* Botão de excluir - posicionado no canto superior direito */}
                      <button
                        className="btn-excluir-refeicao"
                        onClick={(e) => {
                          e.stopPropagation();
                          excluirRefeicao(refeicao.id, refeicao.nome_tipo);
                        }}
                        title="Excluir refeição"
                      >
                        <FiTrash2 size={22} />
                      </button>
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
                                <td>
                                  {item.quantidade} {item.medida}
                                </td>
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
                            setCurrentMealList(refeicao.nome_tipo);
                            setModalAdd(true);
                          }}
                        >
                          <VscDiffAdded size={40} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Botão para adicionar nova refeição se não houver */}
              {refeicoes.length === 0 && (
                <div
                  className="no-refeicoes"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#aaa",
                  }}
                >
                  <p>Nenhuma refeição hoje</p>
                  <button
                    className="add-btn"
                    onClick={() => {
                      setCurrentMealList("");
                      setModalAdd(true);
                    }}
                    style={{ margin: "10px auto" }}
                  >
                    <MdOutlinePlaylistAdd size={50} />
                  </button>
                </div>
              )}

              {/* BOTÃO ADICIONAL PARA CRIAR NOVA REFEIÇÃO (mesmo quando já tem refeições) */}
              {refeicoes.length > 0 && (
                <div
                  className="nova-refeicao-section"
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    className="add-btn"
                    onClick={() => {
                      setCurrentMealList("");
                      setModalAdd(true);
                    }}
                  >
                    <span>
                      <MdOutlinePlaylistAdd size={50} />
                    </span>
                  </button>
                  <p
                    style={{
                      color: "#aaa",
                      fontSize: "0.8em",
                    }}
                  >
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
                      <span id="metacal">{formatarValor(metaCalorica)}</span>
                    </h1>
                  </div>
                  <div className="metapt2">
                    <h1>
                      <span id="calres">
                        {formatarValor(caloriasRestantes)}
                      </span>
                    </h1>
                    <h2>cal restantes</h2>
                  </div>
                </div>
                <div className="metadt">
                  <h3>Meta</h3>
                  <h5>{user.meta || "Definir meta"}</h5>
                </div>
                <div className="pesoideal">
                  <h3 style={{ color: "white" }}>
                    {user.peso > 0 && user.altura > 0 && user.genero
                      ? pesoIdeal(user.altura, user.genero)
                      : "-"}
                  </h3>
                  <h5 style={{ color: "white" }}>Peso ideal</h5>
                </div>
                <div className="gorduracorporal">
                  <h3 style={{ color: "white" }}>
                    {user.peso > 0 &&
                    user.altura > 0 &&
                    user.idade > 0 &&
                    user.genero
                      ? gorduraCorporalEstimada(
                          user.peso,
                          user.altura,
                          user.idade,
                          user.genero
                        )
                      : "-"}
                  </h3>
                  <h5 style={{ color: "white" }}>Gordura corporal estimada</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Seção do Perfil */}
          <div className="pfl-content">
            <div className="heading-section">
              <h4 className="nmpfl">{user.nome}</h4>
            </div>

            <div className="pflaln">
              <div className="sts">
                <ul>
                  <li>
                    Peso: <span>{user.peso > 0 ? user.peso + " kg" : "-"}</span>
                  </li>
                  <li>
                    Altura:{" "}
                    <span>{user.altura > 0 ? user.altura + " cm" : "-"}</span>
                  </li>
                  <li>
                    Treino: <span>{user.treinoTipo || "-"}</span>
                  </li>
                  <li>
                    Meta: <span>{user.meta || "-"}</span>
                  </li>
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
                    {user.peso > 0 &&
                    user.altura > 0 &&
                    user.idade > 0 &&
                    user.genero
                      ? calcularIDR(
                          user.peso,
                          user.altura,
                          user.idade,
                          user.genero,
                          user.treinoTipo
                        )
                      : "-"}
                  </span>
                </li>
                <li>
                  Meta calórica:
                  <span>{metaCalorica > 0 ? metaCalorica + " kcal" : "-"}</span>
                </li>
                <li>
                  IMC:
                  <span>
                    {user.peso > 0 && user.altura > 0 && user.genero
                      ? calcularIMC(user.peso, user.altura, user.genero)
                      : "-"}
                  </span>
                </li>
                <li>
                  Consumo de água ideal:
                  <span>
                    {user.peso > 0
                      ? consumoAgua(user.peso, user.treinoTipo)
                      : "-"}
                  </span>
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
