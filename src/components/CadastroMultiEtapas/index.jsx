import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EtapaDadosPessoais from "./EtapaDadosPessoais";
import EtapaPerfil from "./EtapaPerfil";
import EtapaEndereco from "./EtapaEndereco";
import EtapaLogin from "./EtapaLogin";
import EtapaCREF from "./EtapaCREF";
import BarraProgresso from "./BarraProgresso";
import { cadastrarAluno, cadastrarPersonal } from "../../services/Auth/cadastro";
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
    idAcademia: ""
  });

  const totalEtapas = selectedUserType === "personal" ? 5 : 4;

  const etapas = [
    { numero: 1, titulo: "Dados Pessoais", icone: "👤" },
    { numero: 2, titulo: "Perfil", icone: "🎯" },
    { numero: 3, titulo: "Endereço", icone: "📍" },
    { numero: 4, titulo: "Login", icone: "🔐" },
  ];

  if (selectedUserType === "personal") {
    etapas.push({ numero: 5, titulo: "CREF", icone: "📋" });
  }

  // Função para mudar o tipo de usuário
  const handleUserTypeChange = async (type) => {
    if (type === selectedUserType) return;
    
    setIsSwitching(true);
    
    // Animação de transição
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setSelectedUserType(type);
    // Limpar campos específicos ao mudar o tipo
    setDadosFormulario(prev => ({
      ...prev,
      cref_numero: "",
      cref_categoria: "",
      cref_regional: "",
      idAcademia: "",
      cnpj: "",
      nome_fantasia: "",
      razao_social: ""
    }));
    
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
                dadosFormulario.nome_fantasia && 
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
      
      case 4: // Login
        return dadosFormulario.email && 
               dadosFormulario.senha && 
               dadosFormulario.senha === dadosFormulario.confirmarSenha &&
               dadosFormulario.senha.length >= 6;
      
      case 5: // CREF
        return dadosFormulario.cref_numero && 
               dadosFormulario.cref_categoria && 
               dadosFormulario.cref_regional;
      
      default:
        return false;
    }
  };

  // Cadastro inicial (apenas dados básicos)
  const handleCadastroInicial = async () => {
    setLoading(true);
    setIsAnimating(true);
    
    try {
      const dadosCadastro = {
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

      let resultado;
      if (selectedUserType === "aluno") {
        resultado = await cadastrarAluno(dadosCadastro);
      } else {
        // Adicionar dados específicos do personal
        dadosCadastro.cref_numero = dadosFormulario.cref_numero.replace(/\D/g, "");
        dadosCadastro.cref_categoria = dadosFormulario.cref_categoria;
        dadosCadastro.cref_regional = dadosFormulario.cref_regional;
        dadosCadastro.idAcademia = dadosFormulario.idAcademia;
        
        resultado = await cadastrarPersonal(dadosCadastro);
      }

      if (resultado.success) {
        setUsuarioCadastrado({
          id: selectedUserType === "aluno" ? resultado.idAluno : resultado.idPersonal,
          tipo: selectedUserType
        });
        
        // Avançar para completar perfil
        avancarEtapa();
      } else {
        alert(resultado.error || "Erro ao realizar cadastro inicial");
      }
    } catch (error) {
      console.error("Erro no cadastro inicial:", error);
      alert("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
      setIsAnimating(false);
    }
  };

  // Completar cadastro (dados do perfil)
  // No método handleCompletarCadastro, atualize as URLs:
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

        // CORRIGIDO: Remove /api/ da URL
        const endpoint = selectedUserType === "aluno" 
        ? "cadastro/completar-aluno" 
        : "cadastro/completar-personal";

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
    if (etapaAtual === 4 && !usuarioCadastrado) {
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
        return (
          <EtapaDadosPessoais
            dados={dadosFormulario}
            onChange={atualizarDados}
            tipoUsuario={selectedUserType}
          />
        );
      
      case 2:
        return (
          <EtapaPerfil
            dados={dadosFormulario}
            onChange={atualizarDados}
            tipoUsuario={selectedUserType}
          />
        );
      
      case 3:
        return (
          <EtapaEndereco
            dados={dadosFormulario}
            onChange={atualizarDados}
          />
        );
      
      case 4:
        return (
          <EtapaLogin
            dados={dadosFormulario}
            onChange={atualizarDados}
          />
        );
      
      case 5:
        return (
          <EtapaCREF
            dados={dadosFormulario}
            onChange={atualizarDados}
          />
        );
      
      default:
        return null;
    }
  };

  const getTextoBotao = () => {
    if (etapaAtual === 4 && !usuarioCadastrado) {
      return loading ? "Cadastrando..." : "Cadastrar e Continuar";
    } else if (etapaAtual === totalEtapas && usuarioCadastrado) {
      return loading ? "Finalizando..." : "Finalizar Cadastro";
    } else {
      return "Próximo";
    }
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
          className={etapaAtual === totalEtapas ? "btn-finalizar" : "btn-avancar"}
          onClick={etapaAtual === 4 || etapaAtual === totalEtapas ? handleFinalizar : avancarEtapa}
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