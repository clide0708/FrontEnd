import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EtapaDadosPessoais from "./EtapaDadosPessoais";
import EtapaPerfil from "./EtapaPerfil";
import EtapaEndereco from "./EtapaEndereco";
import EtapaAcademia from "./EtapaAcademia";
import EtapaLogin from "./EtapaLogin";
import EtapaCREF from "./EtapaCREF";
import BarraProgresso from "./BarraProgresso";
import { cadastrarAluno, cadastrarPersonal, cadastrarAcademia } from "../../services/Auth/cadastro";
import academiaService from "../../services/Academia/academia";
import { User, Dumbbell, Building, Loader2 } from "lucide-react";
import "./style.css";

const CadastroMultiEtapas = ({ tipoUsuario = "aluno" }) => {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usuarioCadastrado, setUsuarioCadastrado] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(tipoUsuario);

  const userTypes = [
    { 
      id: "aluno", 
      label: "Aluno", 
      icon: User, 
      color: "#368DD9",
      shortLabel: "Aluno"
    },
    { 
      id: "personal", 
      label: "Personal Trainer", 
      icon: Dumbbell, 
      color: "#4CAF50",
      shortLabel: "Personal"
    },
    { 
      id: "academia", 
      label: "Academia", 
      icon: Building, 
      color: "#FF6B35",
      shortLabel: "Academia"
    }
  ];

  const [dadosFormulario, setDadosFormulario] = useState({
    // Dados pessoais (Etapa 1)
    nome: "",
    cpf: "",
    rg: "",
    numTel: "",
    
    // Campos específicos para academia
    cnpj: "",
    nome_fantasia: "",
    razao_social: "",
    
    // Perfil (Etapa 2)
    data_nascimento: "",
    genero: "",
    altura: "",
    meta: "",
    sobre: "",
    treinos_adaptados: false,
    modalidades: [],
    foto_url: "",
    foto_blob: null,
    
    // Endereço (Etapa 3)
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    
    // Login (Etapa 4)
    email: "",
    senha: "",
    confirmarSenha: "",
    
    // CREF (Etapa 5 - apenas personal)
    cref_numero: "",
    cref_categoria: "",
    cref_regional: "",
    idAcademia: "",
  });

  const getTotalEtapas = () => {
    switch (selectedUserType) {
      case "personal": return 6;
      case "aluno": return 5;
      case "academia": return 4;
      default: return 4;
    }
  };

  const totalEtapas = getTotalEtapas();

  const getEtapas = () => {
    const etapasBase = [
      { numero: 1, titulo: "Dados Pessoais", icone: "👤" },
      { numero: 2, titulo: "Perfil", icone: "🎯" },
      { numero: 3, titulo: "Endereço", icone: "📍" },
    ];

    // Adiciona etapa de academia para aluno e personal
    if (selectedUserType === "aluno" || selectedUserType === "personal") {
      etapasBase.push({ numero: 4, titulo: "Academia", icone: "🏢" });
    }

    // ⭐⭐ CORREÇÃO: CREF vem ANTES do Login para personal
    if (selectedUserType === "personal") {
      etapasBase.push({ numero: 5, titulo: "CREF", icone: "📋" });
    }

    // Adiciona etapa de login (sempre a última antes do cadastro)
    const etapaLoginNumero = selectedUserType === "personal" ? 6 : 
                          selectedUserType === "aluno" ? 5 : 4;
    etapasBase.push({ numero: etapaLoginNumero, titulo: "Login", icone: "🔐" });

    return etapasBase;
  };

  const etapas = getEtapas();

  // Função para mudar o tipo de usuário
  const handleUserTypeChange = async (type) => {
    if (type === selectedUserType) return;
    
    setIsSwitching(true);
    
    // Animação de transição
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // ⭐⭐ NOVA LÓGICA INTELIGENTE DE REAPROVEITAMENTO ⭐⭐
    setDadosFormulario(prev => {
      const novosDados = { ...prev };
      
      // Se mudando PARA academia, remove dados pessoais específicos
      if (type === 'academia') {
        delete novosDados.cpf;
        delete novosDados.rg;
        delete novosDados.data_nascimento;
        delete novosDados.genero;
        delete novosDados.altura;
        delete novosDados.meta;
      }
      
      // Se mudando DE academia, remove dados empresariais  
      if (selectedUserType === 'academia') {
        delete novosDados.nome_fantasia;
        delete novosDados.razao_social;
      }
      
      // Se mudando PARA aluno/personal DE academia, ajusta nome
      if ((type === 'aluno' || type === 'personal') && selectedUserType === 'academia') {
        // Se o nome atual for provavelmente nome fantasia, limpa para dados pessoais
        if (novosDados.nome && !novosDados.nome.includes('Academia') && !novosDados.nome.includes('Studio')) {
          // Mantém o nome se parecer com nome pessoal
        } else {
          novosDados.nome = '';
        }
      }
      
      // Limpa campos específicos do novo tipo
      return {
        ...novosDados,
        cref_numero: "", 
        cref_categoria: "", 
        cref_regional: "",
        cnpj: "", 
        nome_fantasia: "", 
        razao_social: "", 
        idAcademia: "",
        
        // Limpa campos específicos que não fazem sentido no novo contexto
        ...(type !== 'aluno' && { altura: "", meta: "" }),
        ...(type !== 'personal' && { sobre: "" })
      };
    });
    
    setSelectedUserType(type);
    
    // Finalizar animação
    setTimeout(() => setIsSwitching(false), 300);
  };

  const avancarEtapa = () => {
    if (etapaAtual < totalEtapas) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const voltarEtapa = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const atualizarDados = (novosDados) => {
    setDadosFormulario(prev => ({ ...prev, ...novosDados }));
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1: // Dados pessoais
        if (selectedUserType === 'academia') {
          return dadosFormulario.nome && 
                dadosFormulario.cnpj && 
                dadosFormulario.razao_social;
        } else {
          return dadosFormulario.nome && 
                dadosFormulario.cpf && 
                dadosFormulario.rg && 
                dadosFormulario.numTel;
        }
      
      case 2: // Perfil
        return dadosFormulario.data_nascimento && 
              dadosFormulario.genero &&
              dadosFormulario.modalidades.length > 0;
      
      case 3: // Endereço
        return dadosFormulario.cep && 
              dadosFormulario.cidade && 
              dadosFormulario.estado;
      
      case 4: // Academia (opcional para aluno/personal)
        if (selectedUserType === "aluno" || selectedUserType === "personal") {
          return true; // Academia é opcional, sempre válida
        } else {
          return dadosFormulario.email && 
                dadosFormulario.senha && 
                dadosFormulario.senha === dadosFormulario.confirmarSenha &&
                dadosFormulario.senha.length >= 6;
        }
      
      case 5: // CREF para personal, Login para aluno
        if (selectedUserType === "personal") {
          return dadosFormulario.cref_numero && 
                dadosFormulario.cref_categoria && 
                dadosFormulario.cref_regional;
        } else {
          return dadosFormulario.email && 
                dadosFormulario.senha && 
                dadosFormulario.senha === dadosFormulario.confirmarSenha &&
                dadosFormulario.senha.length >= 6;
        }

      case 6: // Login apenas para personal
        return dadosFormulario.email && 
              dadosFormulario.senha && 
              dadosFormulario.senha === dadosFormulario.confirmarSenha &&
              dadosFormulario.senha.length >= 6;
      
      default:
        return false;
    }
  };

  const handleCadastroInicial = async () => {
    setLoading(true);
    setIsAnimating(true);
    
    try {
      let dadosCadastro;

      if (selectedUserType === "academia") {
        // Dados específicos para academia
        dadosCadastro = {
          nome: dadosFormulario.nome,
          razao_social: dadosFormulario.razao_social,
          cnpj: dadosFormulario.cnpj.replace(/\D/g, ""),
          email: dadosFormulario.email,
          senha: dadosFormulario.senha,
          telefone: dadosFormulario.numTel.replace(/\D/g, ""),
          // Endereço
          cep: dadosFormulario.cep.replace(/\D/g, ""),
          logradouro: dadosFormulario.logradouro,
          numero: dadosFormulario.numero,
          complemento: dadosFormulario.complemento,
          bairro: dadosFormulario.bairro,
          cidade: dadosFormulario.cidade,
          estado: dadosFormulario.estado,
          pais: dadosFormulario.pais
        };
      } else {
        // Dados para aluno e personal
        dadosCadastro = {
          nome: dadosFormulario.nome,
          cpf: dadosFormulario.cpf.replace(/\D/g, ""),
          rg: dadosFormulario.rg,
          numTel: dadosFormulario.numTel.replace(/\D/g, ""),
          email: dadosFormulario.email,
          senha: dadosFormulario.senha,
          // Endereço
          cep: dadosFormulario.cep.replace(/\D/g, ""),
          logradouro: dadosFormulario.logradouro,
          numero: dadosFormulario.numero,
          complemento: dadosFormulario.complemento,
          bairro: dadosFormulario.bairro,
          cidade: dadosFormulario.cidade,
          estado: dadosFormulario.estado,
          pais: dadosFormulario.pais
        };

        if (selectedUserType === "personal") {
          dadosCadastro.cref_numero = dadosFormulario.cref_numero.replace(/\D/g, "");
          dadosCadastro.cref_categoria = dadosFormulario.cref_categoria;
          dadosCadastro.cref_regional = dadosFormulario.cref_regional;
          dadosCadastro.idAcademia = dadosFormulario.idAcademia || null;
        }
      }

      console.log('📤 Dados sendo enviados para cadastro:', dadosCadastro);

      let resultado;
      if (selectedUserType === "aluno") {
        resultado = await cadastrarAluno(dadosCadastro);
      } else if (selectedUserType === "personal") {
        resultado = await cadastrarPersonal(dadosCadastro);
      } else {
        resultado = await cadastrarAcademia(dadosCadastro);
      }

      if (resultado.success) {
        const usuarioId = selectedUserType === "aluno" ? resultado.idAluno : 
                         selectedUserType === "personal" ? resultado.idPersonal : 
                         resultado.idAcademia;
        
        setUsuarioCadastrado({
          id: usuarioId,
          tipo: selectedUserType
        });

        // ENVIAR SOLICITAÇÃO DE VINCULAÇÃO SE ACADEMIA FOI SELECIONADA
        if (dadosFormulario.idAcademia && selectedUserType !== "academia") {
          try {
            await academiaService.enviarSolicitacaoVinculacao({
              idAcademia: dadosFormulario.idAcademia,
              idUsuario: usuarioId,
              tipoUsuario: selectedUserType,
              mensagem: "Solicitação enviada durante o cadastro"
            });
            console.log('✅ Solicitação de vinculação enviada para a academia');
          } catch (error) {
            console.warn('⚠️ Erro ao enviar solicitação de vinculação:', error);
            // Não impede o cadastro se a solicitação falhar
          }
        }
        
        // Avançar para completar perfil
        avancarEtapa();
      } else {
        alert(resultado.error || "Erro ao realizar cadastro inicial");
      }
    } catch (error) {
      console.error("Erro no cadastro inicial:", error);
      if (error.response?.data?.error) {
        alert(`Erro: ${error.response.data.error}`);
      } else {
        alert("Erro ao realizar cadastro. Tente novamente.");
      }
    } finally {
      setLoading(false);
      setIsAnimating(false);
    }
  };

  const handleCompletarCadastro = async () => {
    if (!usuarioCadastrado) {
      alert("Erro: usuário não cadastrado.");
      return;
    }

    setLoading(true);
    
    try {
      const dadosPerfil = {
        [selectedUserType === "aluno" ? "idAluno" : "idPersonal"]: usuarioCadastrado.id,
        data_nascimento: dadosFormulario.data_nascimento,
        genero: dadosFormulario.genero,
        foto_url: dadosFormulario.foto_url,
        treinos_adaptados: dadosFormulario.treinos_adaptados ? 1 : 0,
        modalidades: dadosFormulario.modalidades
      };

      // Adicionar campos específicos
      if (selectedUserType === "aluno") {
        dadosPerfil.altura = dadosFormulario.altura ? parseFloat(dadosFormulario.altura) : null;
        dadosPerfil.meta = dadosFormulario.meta;
      } else {
        dadosPerfil.sobre = dadosFormulario.sobre;
      }

      const endpoint = selectedUserType === "aluno" 
        ? "cadastro/completar-aluno" 
        : "cadastro/completar-personal";

      // Use fetch diretamente SEM headers de autorização
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosPerfil),
      });

      const resultado = await response.json();

      if (resultado.success) {
        navigate("/login", {
          state: {
            message: "Cadastro realizado com sucesso! Faça login para continuar.",
            email: dadosFormulario.email
          }
        });
      } else {
        alert(resultado.error || "Erro ao completar cadastro");
      }
    } catch (error) {
      console.error("Erro ao completar cadastro:", error);
      alert("Erro ao completar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = () => {
    // Determinar qual etapa finaliza o cadastro inicial
    const etapaCadastroInicial = selectedUserType === "personal" ? 6 : 
                                selectedUserType === "aluno" ? 5 : 4;

    if (etapaAtual === etapaCadastroInicial && !usuarioCadastrado) {
      // Primeira parte do cadastro (dados básicos + login)
      handleCadastroInicial();
    } else if (etapaAtual === totalEtapas && usuarioCadastrado) {
      // Segunda parte (completar perfil)
      handleCompletarCadastro();
    }
  };

  const renderizarEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return <EtapaDadosPessoais dados={dadosFormulario} onChange={atualizarDados} tipoUsuario={selectedUserType} />;
      
      case 2:
        return <EtapaPerfil dados={dadosFormulario} onChange={atualizarDados} tipoUsuario={selectedUserType} />;
      
      case 3:
        return <EtapaEndereco dados={dadosFormulario} onChange={atualizarDados} />;
      
      case 4:
        if (selectedUserType === "aluno" || selectedUserType === "personal") {
          return <EtapaAcademia dados={dadosFormulario} onChange={atualizarDados} tipoUsuario={selectedUserType} />;
        } else {
          return <EtapaLogin dados={dadosFormulario} onChange={atualizarDados} />;
        }
      
      case 5:
        // ⭐⭐ CORREÇÃO: Etapa 5 é CREF para personal, Login para aluno
        if (selectedUserType === "personal") {
          return <EtapaCREF dados={dadosFormulario} onChange={atualizarDados} />;
        } else if (selectedUserType === "aluno") {
          return <EtapaLogin dados={dadosFormulario} onChange={atualizarDados} />;
        }
        return null;
      
      case 6:
        // ⭐⭐ CORREÇÃO: Etapa 6 é APENAS Login para personal
        if (selectedUserType === "personal") {
          return <EtapaLogin dados={dadosFormulario} onChange={atualizarDados} />;
        }
        return null;
      
      default:
        return null;
    }
  };

  const getAcaoBotao = () => {
    // Se já fez cadastro inicial e está completando perfil
    if (usuarioCadastrado && etapaAtual === totalEtapas) {
      return 'completar';
    }
    
    // Se está na última etapa ANTES do cadastro inicial
    if (!usuarioCadastrado && etapaAtual === totalEtapas) {
      return 'cadastrar';
    }
    
    // Se é academia na etapa 4 (login) - última etapa para academia
    if (!usuarioCadastrado && selectedUserType === 'academia' && etapaAtual === 4) {
      return 'cadastrar';
    }
    
    // Para todas outras situações, é "Próximo"
    return 'avancar';
  };

  const acaoBotao = getAcaoBotao();

  // Texto do botão baseado na ação
  const getTextoBotao = () => {
    if (loading) {
      return acaoBotao === 'completar' ? 'Finalizando...' : 
            acaoBotao === 'cadastrar' ? 'Cadastrando...' : 'Próximo';
    }
    
    return acaoBotao === 'completar' ? 'Finalizar Cadastro' :
          acaoBotao === 'cadastrar' ? 'Cadastrar e Continuar' : 'Próximo';
  };

  const CurrentIcon = userTypes.find(type => type.id === selectedUserType)?.icon || User;
  const currentType = userTypes.find(type => type.id === selectedUserType);

  return (
    <div className="cadastro-multi-etapas">
      <div className="cadastro-header">
        <h1>Criar Conta - {currentType?.label}</h1>
        <p>Complete seu cadastro em {totalEtapas} etapas simples</p>
      </div>

      {/* Seletor de Tipo de Usuário Compacto (igual ao antigo) */}
      <div className="user-type-selector-compact">
        <div className="user-type-slider">
          <div className="slider-track">
            <div 
              className="slider-thumb" 
              style={{ 
                transform: `translateX(${userTypes.findIndex(type => type.id === selectedUserType) * 100}%)`,
                backgroundColor: currentType?.color 
              }}
            />
          </div>
          <div className="user-type-buttons">
            {userTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`user-type-btn ${selectedUserType === type.id ? 'active' : ''}`}
                  onClick={() => handleUserTypeChange(type.id)}
                  style={{ color: selectedUserType === type.id ? type.color : '#aaa' }}
                >
                  <IconComponent size={20} />
                  <span>{type.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Indicador do Tipo Atual */}
        <div className={`current-type-indicator ${isSwitching ? 'switching' : ''}`}>
          <div className="indicator-icon" style={{ color: currentType?.color }}>
            <CurrentIcon size={24} />
          </div>
          <span className="indicator-label">{currentType?.label}</span>
        </div>
      </div>

      <BarraProgresso
        etapas={etapas}
        etapaAtual={etapaAtual}
        tipoUsuario={selectedUserType}
      />

      <div className={`etapa-conteudo ${isAnimating ? 'pulse-animation' : ''}`}>
        {renderizarEtapa()}
      </div>

      <div className="navegacao-etapas">
        {etapaAtual > 1 && (
          <button
            type="button"
            className="btn-voltar"
            onClick={voltarEtapa}
            disabled={loading}
          >
            Voltar
          </button>
        )}

        <button
          type="button"
          className={acaoBotao !== 'avancar' ? "btn-finalizar" : "btn-avancar"}
          onClick={
            acaoBotao === 'completar' ? handleCompletarCadastro :
            acaoBotao === 'cadastrar' ? handleCadastroInicial :
            avancarEtapa
          }
          disabled={!validarEtapa(etapaAtual) || loading}
        >
          {loading ? (
            <>
              <Loader2 className="spinner" size={20} />
              {getTextoBotao()}
            </>
          ) : (
            getTextoBotao()
          )}
        </button>
      </div>

      {usuarioCadastrado && (
        <div className="cadastro-pendente">
          <p>✅ Cadastro básico realizado! Complete seu perfil para finalizar.</p>
        </div>
      )}
    </div>
  );
};

export default CadastroMultiEtapas;