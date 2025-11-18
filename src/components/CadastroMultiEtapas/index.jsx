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
    
    // Dados da Academia (Etapa Perfil para Academia)
    tamanho_estrutura: "",
    capacidade_maxima: "",
    ano_fundacao: "",
    estacionamento: false,
    vestiario: false,
    ar_condicionado: false,
    wifi: false,
    totem_de_carregamento_usb: false,
    area_descanso: false,
    avaliacao_fisica: false,

     // Horários (será um array de objetos)
    horarios: [
      { dia_semana: 'Segunda-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
      { dia_semana: 'Terça-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
      { dia_semana: 'Quarta-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
      { dia_semana: 'Quinta-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
      { dia_semana: 'Sexta-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
      { dia_semana: 'Sábado', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
      { dia_semana: 'Domingo', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false }
    ],

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

    // CREF vem ANTES do Login para personal
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
    console.log('🔄 Atualizando dados:', novosDados);
    setDadosFormulario(prev => {
      const dadosAtualizados = { ...prev, ...novosDados };
      console.log('📊 Dados após atualização:', dadosAtualizados);
      return dadosAtualizados;
    });
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
       case 1: // Dados pessoais
        if (selectedUserType === 'academia') {
          return dadosFormulario.nome_fantasia && 
                dadosFormulario.cnpj && 
                dadosFormulario.razao_social &&
                dadosFormulario.numTel;
        } else {
          return dadosFormulario.nome && 
                dadosFormulario.cpf && 
                dadosFormulario.rg && 
                dadosFormulario.numTel;
        }
        
      case 2: // Perfil
        if (selectedUserType === 'academia') {
          return dadosFormulario.modalidades && dadosFormulario.modalidades.length > 0;
        } else {
          // 🔥 CORREÇÃO: Apenas verificar se há modalidades selecionadas
          // Não bloquear por data_nascimento/genero nesta etapa
          const temModalidades = dadosFormulario.modalidades && dadosFormulario.modalidades.length > 0;
          console.log('🔍 Validação etapa 2 - Modalidades:', temModalidades);
          return temModalidades;
        }
      
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
      // MOVER a declaração de dadosCadastro para dentro do try
      let dadosCadastro;

      if (selectedUserType === "academia") {
        if (!dadosFormulario.nome_fantasia || !dadosFormulario.razao_social || !dadosFormulario.cnpj) {
          alert("Por favor, preencha todos os campos obrigatórios: Nome Fantasia, Razão Social e CNPJ");
          setLoading(false);
          setIsAnimating(false);
          return;
        }

        // Dados específicos para academia
        dadosCadastro = {
          nome: dadosFormulario.nome_fantasia,
          nome_fantasia: dadosFormulario.nome_fantasia,
          razao_social: dadosFormulario.razao_social,
          cnpj: dadosFormulario.cnpj.replace(/\D/g, ""),
          email: dadosFormulario.email,
          senha: dadosFormulario.senha,
          telefone: dadosFormulario.numTel.replace(/\D/g, ""),
          // Novos campos
          tamanho_estrutura: dadosFormulario.tamanho_estrutura,
          capacidade_maxima: dadosFormulario.capacidade_maxima,
          ano_fundacao: dadosFormulario.ano_fundacao,
          estacionamento: dadosFormulario.estacionamento ? 1 : 0,
          vestiario: dadosFormulario.vestiario ? 1 : 0,
          ar_condicionado: dadosFormulario.ar_condicionado ? 1 : 0,
          wifi: dadosFormulario.wifi ? 1 : 0,
          totem_de_carregamento_usb: dadosFormulario.totem_de_carregamento_usb ? 1 : 0,
          area_descanso: dadosFormulario.area_descanso ? 1 : 0,
          avaliacao_fisica: dadosFormulario.avaliacao_fisica ? 1 : 0,
          horarios: dadosFormulario.horarios || [],
          // Endereço - ADICIONAR ESTES CAMPOS
          cep: dadosFormulario.cep?.replace(/\D/g, "") || "",
          logradouro: dadosFormulario.logradouro || "",
          numero: dadosFormulario.numero || "",
          complemento: dadosFormulario.complemento || "",
          bairro: dadosFormulario.bairro || "",
          cidade: dadosFormulario.cidade || "",
          estado: dadosFormulario.estado || "",
          pais: dadosFormulario.pais || "Brasil",
          // Modalidades - ADICIONAR
          modalidades: dadosFormulario.modalidades || []
        };

        console.log('📤 Dados sendo enviados para cadastro de academia:', dadosCadastro);
        console.log('🔍 nome_fantasia:', dadosFormulario.nome_fantasia);
        console.log('🔍 razao_social:', dadosFormulario.razao_social);
        console.log('🔍 cnpj:', dadosFormulario.cnpj);
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
      console.error("❌ Erro detalhado no cadastro inicial:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        dadosEnviados: dadosCadastro
      });
      
      if (error.response?.data?.error) {
        alert(`Erro: ${error.response.data.error}`);
      } else {
        alert("Erro ao realizar cadastro. Verifique o console para mais detalhes.");
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
        // 🔥 CORREÇÃO: Usar FormData para enviar arquivos
        const formData = new FormData();
        
        // Adicionar ID baseado no tipo de usuário
        const idField = selectedUserType === "aluno" ? "idAluno" : 
                       selectedUserType === "personal" ? "idPersonal" : "idAcademia";
        formData.append(idField, usuarioCadastrado.id);
        
        // Campos comuns a todos os tipos
        if (selectedUserType !== "academia") {
            formData.append("data_nascimento", dadosFormulario.data_nascimento || '');
            formData.append("genero", dadosFormulario.genero || '');
        }
        
        formData.append("treinos_adaptados", dadosFormulario.treinos_adaptados ? '1' : '0');
        
        // Adicionar campos específicos
        if (selectedUserType === "aluno") {
            formData.append("altura", dadosFormulario.altura || '');
            formData.append("meta", dadosFormulario.meta || '');
        } else if (selectedUserType === "personal") {
            formData.append("sobre", dadosFormulario.sobre || '');
        } else if (selectedUserType === "academia") {
            // Campos específicos da academia
            formData.append("sobre", dadosFormulario.sobre || '');
            formData.append("tamanho_estrutura", dadosFormulario.tamanho_estrutura || '');
            formData.append("capacidade_maxima", dadosFormulario.capacidade_maxima || '');
            formData.append("ano_fundacao", dadosFormulario.ano_fundacao || '');
            formData.append("estacionamento", dadosFormulario.estacionamento ? '1' : '0');
            formData.append("vestiario", dadosFormulario.vestiario ? '1' : '0');
            formData.append("ar_condicionado", dadosFormulario.ar_condicionado ? '1' : '0');
            formData.append("wifi", dadosFormulario.wifi ? '1' : '0');
            formData.append("totem_de_carregamento_usb", dadosFormulario.totem_de_carregamento_usb ? '1' : '0');
            formData.append("area_descanso", dadosFormulario.area_descanso ? '1' : '0');
            formData.append("avaliacao_fisica", dadosFormulario.avaliacao_fisica ? '1' : '0');
            
            // Horários da academia
            if (dadosFormulario.horarios) {
                dadosFormulario.horarios.forEach((horario, index) => {
                    formData.append(`horarios[${index}][dia_semana]`, horario.dia_semana);
                    formData.append(`horarios[${index}][aberto_24h]`, horario.aberto_24h ? '1' : '0');
                    formData.append(`horarios[${index}][horario_abertura]`, horario.horario_abertura || '');
                    formData.append(`horarios[${index}][horario_fechamento]`, horario.horario_fechamento || '');
                    formData.append(`horarios[${index}][fechado]`, horario.fechado ? '1' : '0');
                });
            }
        }

        // 🔥 CORREÇÃO CRÍTICA: Corrigir o nome da propriedade e adicionar verificação de segurança
        // Adicionar modalidades para todos os tipos
        if (dadosFormulario.modalidades && Array.isArray(dadosFormulario.modalidades)) {
            dadosFormulario.modalidades.forEach((modalidade, index) => {
                formData.append("modalidades[]", modalidade);
                console.log('📝 Adicionando modalidade:', modalidade, 'índice:', index);
            });
            console.log('✅ Total de modalidades enviadas:', dadosFormulario.modalidades.length);
        } else {
            console.log('⚠️ Nenhuma modalidade para enviar ou modalidades não é um array');
            console.log('🔍 Tipo de modalidades:', typeof dadosFormulario.modalidades);
            console.log('🔍 Valor de modalidades:', dadosFormulario.modalidades);
        }

        // 🔥 IMPORTANTE: Se já temos uma foto com URL (do upload anterior), enviar apenas a URL
        if (dadosFormulario.foto_url) {
            formData.append("foto_url", dadosFormulario.foto_url);
        }

        // 🔥 USAR ENDPOINT ÚNICO PARA TODOS OS TIPOS
        const endpoint = "cadastro/processar-completo";

        console.log('📤 Enviando dados completos do cadastro para:', selectedUserType);
        console.log('🔍 Dados do formulário:', {
            modalidades: dadosFormulario.modalidades,
            temFoto: !!dadosFormulario.foto_url,
            tipoUsuario: selectedUserType
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
            method: "POST",
            body: formData,
        });

        const resultado = await response.json();

        if (resultado.success) {
            console.log('✅ Cadastro completo realizado para:', selectedUserType);
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
        // Etapa 5 é CREF para personal, Login para aluno
        if (selectedUserType === "personal") {
          return <EtapaCREF dados={dadosFormulario} onChange={atualizarDados} />;
        } else if (selectedUserType === "aluno") {
          return <EtapaLogin dados={dadosFormulario} onChange={atualizarDados} />;
        }
        return null;
      
      case 6:
        // Etapa 6 é APENAS Login para personal
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