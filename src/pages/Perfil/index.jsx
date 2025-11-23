import { useState, useEffect, useCallback } from "react";
import perfilService from "../../services/Perfil/perfil";
import treinosService from "../../services/Treinos/treinos";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiEdit2, FiSave, FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import { 
  User, 
  Dumbbell, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  IdCard,
  Target,
  Ruler,
  Calendar,
  Users,
  Clock
} from "lucide-react";
import CropModal from "./modalCrop";
import PlanModal from "./modalPlano";
import "../../assets/css/style.css";
import "../../assets/css/templatemo-cyborg-gaming.css";
import "./style_perfil.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [form, setForm] = useState({});
  const [endereco, setEndereco] = useState({});
  const [modalidades, setModalidades] = useState([]);
  const [academias, setAcademias] = useState([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [historicoTreinos, setHistoricoTreinos] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔥 CORREÇÃO: Obter usuário do localStorage corretamente
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    try {
      const usuarioStorage = localStorage.getItem("usuario");
      return usuarioStorage ? JSON.parse(usuarioStorage) : null;
    } catch (error) {
      console.error("Erro ao ler usuário do localStorage:", error);
      return null;
    }
  });

  const tipoUsuario = usuarioLogado?.tipo;
  const email = usuarioLogado?.email;
  const idUsuario = usuarioLogado?.id;

  // 🔥 CORREÇÃO DEFINITIVA: Função para obter URL da foto
  const getFotoUrl = (fotoUrl) => {
    console.log("🖼️ Processando foto URL:", fotoUrl);
    
    // Se não tem foto ou é inválida, retorna padrão
    if (!fotoUrl || fotoUrl === 'null' || fotoUrl === 'undefined' || fotoUrl === '') {
      console.log("🖼️ Sem foto, usando padrão");
      return "/assets/images/profilefoto.png";
    }
    
    // Se já é uma URL completa (http ou https)
    if (fotoUrl.startsWith('http')) {
      console.log("🖼️ URL completa detectada:", fotoUrl);
      return fotoUrl;
    }
    
    // 🔥 CORREÇÃO PRINCIPAL: Se é um caminho relativo, converter para URL absoluta
    // O backend retorna '/assets/images/uploads/nome.jpg'
    // Precisamos converter para 'http://localhost/BackEnd/assets/images/uploads/nome.jpg'
    
    let caminhoCorrigido = fotoUrl;
    
    // Se começa com /, remover a barra inicial para evitar duplicação
    if (caminhoCorrigido.startsWith('/')) {
      caminhoCorrigido = caminhoCorrigido.substring(1);
    }
    
    // Construir URL absoluta usando a base da API
    const urlBase = import.meta.env.VITE_API_URL.replace('/api', '');
    const urlAbsoluta = `${urlBase}${caminhoCorrigido}`;
    
    console.log("🖼️ URL absoluta construída:", urlAbsoluta);
    return urlAbsoluta;
  };

  // No useEffect, após carregar o usuário, adicione:
  useEffect(() => {
    if (user) {
      console.log("🔍 DEBUG COMPLETO DO USUÁRIO:", {
        usuario: user,
        foto_url: user.foto_url,
        getFotoUrl: getFotoUrl(user.foto_url),
        tipoUsuario: tipoUsuario,
        idUsuario: idUsuario
      });
      
      // Testar se a imagem é acessível
      if (user.foto_url) {
        const img = new Image();
        img.onload = () => console.log("✅ Imagem é acessível e carrega");
        img.onerror = () => console.log("❌ Imagem NÃO é acessível");
        img.src = getFotoUrl(user.foto_url);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('🔄 Carregando dados do usuário no form:', user);
      setForm({
        ...user,
        // Garantir que modalidades seja um array
        modalidades: user.modalidades || []
      });
      
      // Debug das modalidades
      console.log('🎯 Modalidades do usuário:', user.modalidades);
      console.log('🎯 Tipo das modalidades:', typeof user.modalidades);
    }
  }, [user]);

  useEffect(() => {
    const carregarHistoricoTreinos = async () => {
      if (tipoUsuario !== 'aluno') return;
      
      setLoadingHistorico(true);
      try {
        console.log("📊 Carregando histórico de treinos...");
        
        // 🔥 CORREÇÃO: Usar o serviço correto para buscar histórico
        const response = await treinosService.getHistoricoTreinos();
        
        if (response && response.success) {
          console.log("✅ Histórico carregado:", response.treinos);
          setHistoricoTreinos(response.treinos || []);
        } else {
          console.log("ℹ️ Nenhum histórico encontrado ou erro:", response?.error);
          setHistoricoTreinos([]);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar histórico:", error);
        setHistoricoTreinos([]);
      } finally {
        setLoadingHistorico(false);
      }
    };

    carregarHistoricoTreinos();
  }, [tipoUsuario]);

  // Carregar dados do perfil
  useEffect(() => {
    const fetchPerfilCompleto = async () => {
      if (!email || !idUsuario || !tipoUsuario) {
        console.error("❌ Dados do usuário não encontrados:", { email, idUsuario, tipoUsuario });
        return;
      }
      
      setLoading(true);
      try {
        console.log("🎯 Buscando perfil para:", { email, idUsuario, tipoUsuario });

        // Buscar dados básicos do usuário
        const data = await perfilService.getPerfil(email);
        console.log("📊 Dados básicos recebidos:", data);
        
        if (data && data.success) {
          const usuario = data.data;
          console.log("👤 Usuário encontrado:", usuario);
          setUser(usuario);
          
          // Buscar perfil completo apenas se tiver ID válido
          if (idUsuario && idUsuario !== 'undefined') {
            console.log("🔍 Buscando perfil completo para ID:", idUsuario);
            const perfilCompleto = await perfilService.getPerfilCompleto(idUsuario, tipoUsuario);
            console.log("📊 Perfil completo recebido:", perfilCompleto);
            
            if (perfilCompleto?.success) {
              const usuarioCompleto = { ...usuario, ...perfilCompleto.data };
              setUser(usuarioCompleto);
              setForm(usuarioCompleto);
              
              // Extrair modalidades se existirem
              if (perfilCompleto.data.modalidades) {
                setModalidades(perfilCompleto.data.modalidades);
              }
            } else {
              console.log("⚠️ Perfil completo não encontrado, usando dados básicos");
              setForm(usuario);
            }
          } else {
            console.log("⚠️ ID inválido, usando dados básicos");
            setForm(usuario);
          }

          // Buscar endereço
          try {
            const enderecoData = await perfilService.getEndereco(email);
            if (enderecoData?.success) {
              setEndereco(enderecoData.data);
            }
          } catch (enderecoError) {
            console.error("❌ Erro ao buscar endereço:", enderecoError);
          }

          // Buscar modalidades disponíveis
          try {
            const modalidadesData = await perfilService.getModalidades();
            if (modalidadesData?.success) {
              setModalidades(modalidadesData.data);
            }
          } catch (modalidadesError) {
            console.error("❌ Erro ao buscar modalidades:", modalidadesError);
          }

          // Buscar academias (para alunos e personais)
          if (tipoUsuario !== 'academia') {
            try {
              const academiasData = await perfilService.getAcademiasAtivas();
              if (academiasData?.success) {
                setAcademias(academiasData.data);
              }
            } catch (academiasError) {
              console.error("❌ Erro ao buscar academias:", academiasError);
            }
          }
        } else {
          console.error("❌ Erro ao buscar dados básicos do usuário:", data?.error);
          alert("Erro ao carregar perfil: " + (data?.error || "Usuário não encontrado"));
        }
      } catch (error) {
        console.error("❌ Erro ao carregar perfil:", error);
        alert("Erro ao carregar perfil: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfilCompleto();
  }, [email, idUsuario, tipoUsuario]);

  // 🔥 CORREÇÃO: Função para upload de foto usando cropImage.js
  const handleSaveCrop = async (croppedAreaPixels, imagemOriginal) => {
    try {
      console.log("🎯 Iniciando processamento da foto...");
      
      // Importar dinamicamente o utilitário de crop
      const getCroppedImg = (await import('../../utils/cropImage')).default;
      
      // Obter o blob da imagem cortada
      const blob = await getCroppedImg(imagemOriginal, croppedAreaPixels);
      
      console.log("📤 Fazendo upload do blob...");

      const formData = new FormData();
      formData.append('foto', blob, `perfil_${Date.now()}.jpg`);

      // Fazer upload para o servidor
      const response = await fetch(`${import.meta.env.VITE_API_URL}upload/foto-perfil`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('✅ Resposta do upload:', result);

      if (result.success) {
        // Atualizar estado local imediatamente
        setForm(prev => ({ ...prev, foto_url: result.url }));
        setUser(prev => ({ ...prev, foto_url: result.url }));
        
        // Fechar modal
        setCropModalOpen(false);
        
        alert('✅ Foto atualizada com sucesso!');
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar foto:', error);
      alert('❌ Erro ao processar foto: ' + error.message);
    }
  };

  // 🔥 CORREÇÃO: Função para remover foto
  const removerFoto = async () => {
    if (!user?.foto_url) {
      console.log("❌ Nenhuma foto para remover");
      return;
    }
    
    try {
      console.log("🗑️ Iniciando remoção da foto:", user.foto_url);
      
      // Extrair nome do arquivo da URL
      const nomeArquivo = user.foto_url.split('/').pop();
      console.log("📝 Nome do arquivo extraído:", nomeArquivo);
      
      if (!nomeArquivo) {
        throw new Error("Não foi possível extrair o nome do arquivo da URL");
      }
      
      // Deletar arquivo físico
      console.log("🔄 Deletando arquivo físico...");
      const deleteResult = await perfilService.deletarFotoPerfil(nomeArquivo);
      console.log("✅ Resultado da deleção:", deleteResult);
      
      if (deleteResult.success) {
        // Atualizar banco de dados para remover a referência da foto
        console.log("🔄 Atualizando banco de dados...");
        const saveResponse = await fetch(`${import.meta.env.VITE_API_URL}upload/salvar-foto-usuario`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idUsuario: user.id,
            tipoUsuario: tipoUsuario,
            foto_url: null
          })
        });

        const saveResult = await saveResponse.json();
        console.log("✅ Resultado do salvamento:", saveResult);
        
        if (saveResult.success) {
          // Atualizar estado local
          setForm(prev => ({ ...prev, foto_url: '' }));
          setUser(prev => ({ ...prev, foto_url: '' }));
          alert('Foto removida com sucesso!');
        } else {
          throw new Error('Erro ao remover referência da foto no banco: ' + saveResult.error);
        }
      } else {
        throw new Error(deleteResult.error || 'Erro ao deletar arquivo');
      }
    } catch (error) {
      console.error('❌ Erro ao remover foto:', error);
      alert('Erro ao remover foto: ' + error.message);
    }
  };

  // Handlers para formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;
    setEndereco(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModalidadeChange = (idModalidade) => {
    setForm(prev => {
      const modalidadesAtuais = prev.modalidades || [];
      
      // Converter tudo para string para comparação
      const modalidadesString = modalidadesAtuais.map(m => 
        typeof m === 'object' ? m.idModalidade.toString() : m.toString()
      );
      
      const idString = idModalidade.toString();
      
      console.log('🎯 Modalidades atuais:', modalidadesString);
      console.log('🎯 ID clicado:', idString);
      
      if (modalidadesString.includes(idString)) {
        // Remover modalidade
        const novasModalidades = modalidadesAtuais.filter(m => {
          const mId = typeof m === 'object' ? m.idModalidade.toString() : m.toString();
          return mId !== idString;
        });
        
        console.log('🗑️ Removendo modalidade. Novas:', novasModalidades);
        return {
          ...prev,
          modalidades: novasModalidades
        };
      } else {
        // Adicionar modalidade
        const novasModalidades = [...modalidadesAtuais, idModalidade];
        console.log('➕ Adicionando modalidade. Novas:', novasModalidades);
        return {
          ...prev,
          modalidades: novasModalidades
        };
      }
    });
  };

  // 🔥 CORREÇÃO: Função para verificar se modalidade está selecionada
  const isModalidadeSelecionada = (idModalidade) => {
    if (!form.modalidades || form.modalidades.length === 0) return false;
    
    const idString = idModalidade.toString();
    return form.modalidades.some(m => {
      const mId = typeof m === 'object' ? m.idModalidade.toString() : m.toString();
      return mId === idString;
    });
  };

  // Salvar perfil
  const saveProfile = async () => {
    setLoading(true);
    try {
      // Preparar dados para envio
      const dadosAtualizacao = {
        email: user.email,
        tipoUsuario: tipoUsuario,
        
        // Dados principais
        nome: form.nome,
        data_nascimento: form.data_nascimento,
        genero: form.genero,
        numTel: form.numTel,
        foto_url: form.foto_url,
        
        // 🔥 CORREÇÃO: Campos específicos para aluno
        ...(tipoUsuario === 'aluno' && {
          altura: form.altura,
          peso: form.peso,
          meta: form.meta,
          treinoTipo: form.treinoTipo,
          treinos_adaptados: form.treinos_adaptados || false
        }),
        
        // Campos para personal
        ...(tipoUsuario === 'personal' && {
          sobre: form.sobre,
          treinos_adaptados: form.treinos_adaptados || false,
          cref_numero: form.cref_numero,
          cref_categoria: form.cref_categoria,
          cref_regional: form.cref_regional
        }),
        
        // Campos para academia
        ...(tipoUsuario === 'academia' && {
          sobre: form.sobre,
          tamanho_estrutura: form.tamanho_estrutura,
          capacidade_maxima: form.capacidade_maxima,
          ano_fundacao: form.ano_fundacao,
          estacionamento: form.estacionamento || false,
          vestiario: form.vestiario || false,
          ar_condicionado: form.ar_condicionado || false,
          wifi: form.wifi || false,
          totem_de_carregamento_usb: form.totem_de_carregamento_usb || false,
          area_descanso: form.area_descanso || false,
          avaliacao_fisica: form.avaliacao_fisica || false
        }),
        
        // 🔥 CORREÇÃO: Modalidades como array de IDs
        modalidades: Array.isArray(form.modalidades) 
          ? form.modalidades.map(m => typeof m === 'object' ? m.idModalidade : m)
          : [],
        
        // Endereço
        endereco: {
          cep: endereco.cep || '',
          logradouro: endereco.logradouro || '',
          numero: endereco.numero || '',
          complemento: endereco.complemento || '',
          bairro: endereco.bairro || '',
          cidade: endereco.cidade || '',
          estado: endereco.estado || '',
          pais: endereco.pais || 'Brasil'
        },
        
        // 🔥 CORREÇÃO: Academia para alunos e personais
        ...(tipoUsuario !== 'academia' && {
          idAcademia: form.idAcademia || null
        })
      };

      console.log('📤 Dados sendo enviados para atualização:', dadosAtualizacao);

      const result = await perfilService.atualizarPerfilCompleto(dadosAtualizacao);
      
      if (result.success) {
        console.log('✅ Perfil atualizado com sucesso');
        
        // Recarregar dados do usuário
        const userData = await perfilService.getPerfilCompleto(user.id, tipoUsuario);
        if (userData?.success) {
          setUser(userData.data);
          setForm(userData.data);
        }
        
        setEditing(false);
        alert('✅ Perfil atualizado com sucesso!');
      } else {
        alert("❌ Erro ao atualizar perfil: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("❌ Erro ao atualizar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Navegação para treinos
  const handleCardClick = async (treino) => {
    if (treino.porcentagem_concluida >= 90) {
      navigate(`/treinos/visualizar/${treino.idTreino}`);
    } else {
      try {
        const response = await treinosService.getSessaoParaRetomar(treino.idSessao);
        if (!response.success) {
          throw new Error(response.error || "Erro ao buscar sessão");
        }

        const { sessao, treino: treinoData, progresso } = response;
        const treinoParaRetomar = {
          ...treinoData,
          idSessao: sessao.idSessao,
          exercicios: treinoData.exercicios.map(ex => ({
            ...ex,
            id: ex.id || ex.idTreino_Exercicio,
            series: ex.series || 3,
            repeticoes: ex.repeticoes || 10,
            descanso: ex.descanso || 60,
            carga: ex.carga || 0,
            url: ex.video_url || ex.url || "",
            grupo: ex.grupoMuscular || ex.grupo || "",
            informacoes: ex.descricao || ex.informacoes || "",
            nome: ex.nome || "Exercício sem nome"
          }))
        };

        navigate("/treinando", {
          state: { 
            treino: treinoParaRetomar,
            progresso: progresso 
          }
        });
      } catch (err) {
        console.error("Erro ao retomar treino:", err);
        alert(`Erro ao retomar treino: ${err.message}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Renderização condicional baseada no tipo de usuário
  const renderCamposAluno = () => (
  <>
    <div className="form-grid">
      <div className="input-group">
        <label><IdCard size={16} /> CPF</label>
        <input
          type="text"
          name="cpf"
          value={form.cpf || ''}
          onChange={handleChange}
          disabled={!editing}
          placeholder="000.000.000-00"
        />
      </div>

      <div className="input-group">
        <label>RG</label>
        <input
          type="text"
          name="rg"
          value={form.rg || ''}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Digite seu RG"
        />
      </div>

      <div className="input-group">
        <label><Ruler size={16} /> Altura (cm)</label>
        <input
          type="number"
          name="altura"
          value={form.altura || ''}
          onChange={handleChange}
          disabled={!editing}
          placeholder="175"
          min="100"
          max="250"
        />
      </div>

      {/* 🔥 CORREÇÃO: Campo Peso */}
      <div className="input-group">
        <label>Peso (kg)</label>
        <input
          type="number"
          name="peso"
          value={form.peso || ''}
          onChange={handleChange}
          disabled={!editing}
          placeholder="70.5"
          min="30"
          max="300"
          step="0.1"
        />
      </div>

      {/* 🔥 CORREÇÃO: Campo Tipo de Treino */}
      <div className="input-group">
        <label>Nível de Atividade</label>
        <select
          name="treinoTipo"
          value={form.treinoTipo || ''}
          onChange={handleChange}
          disabled={!editing}
        >
          <option value="">Selecione seu nível</option>
          <option value="Sedentário">Sedentário (pouco ou nenhum exercício)</option>
          <option value="Leve">Leve (1-3 dias/semana)</option>
          <option value="Moderado">Moderado (3-5 dias/semana)</option>
          <option value="Intenso">Intenso (6-7 dias/semana)</option>
        </select>
      </div>

      <div className="input-group">
        <label><Target size={16} /> Meta Principal</label>
        <select
          name="meta"
          value={form.meta || ''}
          onChange={handleChange}
          disabled={!editing}
        >
          <option value="">Selecione sua meta</option>
          <option value="Perder peso">Perder peso</option>
          <option value="Manter peso">Manter peso</option>
          <option value="Ganhar peso">Ganhar peso</option>
          <option value="Ganhar massa muscular">Ganhar massa muscular</option>
          <option value="Melhorar condicionamento">Melhorar condicionamento</option>
          <option value="Outro">Outro</option>
        </select>
      </div>
    </div>

    {/* 🔥 CORREÇÃO: Treinos Adaptados para Aluno */}
    <div className="checkbox-group">
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="treinos_adaptados"
          checked={form.treinos_adaptados || false}
          onChange={(e) => setForm(prev => ({ ...prev, treinos_adaptados: e.target.checked }))}
          disabled={!editing}
        />
        <span className="checkmark"></span>
        Preciso de treinos adaptados
      </label>
    </div>

    <div className="input-group full-width">
      <label>Academia Vinculada</label>
      <select
        name="idAcademia"
        value={form.idAcademia || ''}
        onChange={handleChange}
        disabled={!editing}
      >
        <option value="">Nenhuma academia vinculada</option>
        {academias.map(academia => (
          <option key={academia.idAcademia} value={academia.idAcademia}>
            {academia.nome}
          </option>
        ))}
      </select>
    </div>
  </>
);

  // 🔥 CORREÇÃO: Render campos do PERSONAL com todos os campos
  const renderCamposPersonal = () => (
    <>
      <div className="form-grid">
        <div className="input-group">
          <label><IdCard size={16} /> CPF</label>
          <input
            type="text"
            name="cpf"
            value={form.cpf || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="000.000.000-00"
          />
        </div>

        <div className="input-group">
          <label>RG</label>
          <input
            type="text"
            name="rg"
            value={form.rg || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Digite seu RG"
          />
        </div>

        <div className="input-group">
          <label>CREF Número</label>
          <input
            type="text"
            name="cref_numero"
            value={form.cref_numero || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Número do CREF"
          />
        </div>

        <div className="input-group">
          <label>CREF Categoria</label>
          <input
            type="text"
            name="cref_categoria"
            value={form.cref_categoria || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Categoria CREF"
          />
        </div>

        <div className="input-group">
          <label>CREF Regional</label>
          <input
            type="text"
            name="cref_regional"
            value={form.cref_regional || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Regional CREF"
          />
        </div>
      </div>

      {/* 🔥 CORREÇÃO: Treinos Adaptados para Personal */}
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="treinos_adaptados"
            checked={form.treinos_adaptados || false}
            onChange={(e) => setForm(prev => ({ ...prev, treinos_adaptados: e.target.checked }))}
            disabled={!editing}
          />
          <span className="checkmark"></span>
          Trabalho com treinos adaptados
        </label>
      </div>

      <div className="input-group full-width">
        <label>Academia Vinculada</label>
        <select
          name="idAcademia"
          value={form.idAcademia || ''}
          onChange={handleChange}
          disabled={!editing}
        >
          <option value="">Nenhuma academia vinculada</option>
          {academias.map(academia => (
            <option key={academia.idAcademia} value={academia.idAcademia}>
              {academia.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group full-width">
        <label>Sobre Você</label>
        <textarea
          name="sobre"
          value={form.sobre || ''}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Conte sobre sua experiência, metodologia de trabalho, especializações..."
          rows={4}
        />
      </div>
    </>
  );

  const renderCamposAcademia = () => (
    <>
      <div className="form-grid">
        <div className="input-group">
          <label>CNPJ</label>
          <input
            type="text"
            name="cnpj"
            value={form.cnpj || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div className="input-group">
          <label>Nome Fantasia</label>
          <input
            type="text"
            name="nome_fantasia"
            value={form.nome_fantasia || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Nome fantasia da academia"
          />
        </div>

        <div className="input-group">
          <label>Razão Social</label>
          <input
            type="text"
            name="razao_social"
            value={form.razao_social || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Razão social completa"
          />
        </div>

        <div className="input-group">
          <label><Phone size={16} /> Telefone</label>
          <input
            type="text"
            name="telefone"
            value={form.telefone || ''}
            onChange={handleChange}
            disabled={!editing}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="input-group full-width">
        <label>Sobre a Academia</label>
        <textarea
          name="sobre"
          value={form.sobre || ''}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Conte sobre sua academia: equipamentos, metodologia, diferenciais..."
          rows={4}
        />
      </div>
    </>
  );

  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!user) return <div className="error">Erro ao carregar perfil</div>;

  return (
    <div className="perfil container" style={{ position: "relative" }}>
      <div className="row">
        <div className="col-lg-12">
          <div className="page-content">
            <div className="main-profile">
              <div className="row">
                {/* Foto de Perfil */}
                <div className="col-lg-12">
                  <div className="foto-section">
                    
                    {editing ? (
                      <div className="foto-editable">
                        <div className="profile-image-container">
                        <img
                          src={getFotoUrl(user?.foto_url)}
                          alt="Perfil"
                          className="profile-image"
                          onError={(e) => {
                            console.error("❌ Erro ao carregar imagem no modo visualização:", e);
                            e.target.src = "/assets/images/profilefoto.png";
                          }}
                          onLoad={(e) => {
                            console.log("✅ Imagem carregada com sucesso no modo visualização:", e.target.src);
                          }}
                        />
                        <div className="profile-image-overlay">
                          <button 
                            className="btn-upload"
                            onClick={() => setCropModalOpen(true)}
                          >
                            <FiUpload size={20} />
                          </button>
                          {user?.foto_url && (
                            <button 
                              className="btn-remove"
                              onClick={removerFoto}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    ) : (
                      <div className="profile-image-container">
                        <img
                          src={getFotoUrl(user?.foto_url)}
                          alt="Perfil"
                          className="profile-image"
                          onError={(e) => {
                            console.error("❌ Erro ao carregar imagem no modo visualização:", e);
                            e.target.src = "/assets/images/profilefoto.png";
                          }}
                          onLoad={(e) => {
                            console.log("✅ Imagem carregada com sucesso no modo visualização:", e.target.src);
                          }}
                        />
                        {/* <div className="profile-image-overlay">
                          <button 
                            className="btn-upload"
                            onClick={() => setCropModalOpen(true)}
                          >
                            <FiUpload size={20} />
                          </button>
                          {user?.foto_url && (
                            <button 
                              className="btn-remove"
                              onClick={removerFoto}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div> */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                {/* Informações Principais */}
                <div className="col-lg-12">
                  <div className="profile-header">
                    <div className="header-actions">
                      <button className="logout-gear" onClick={handleLogout} title="Sair">
                        <FiLogOut size={30} />
                      </button>
                      {!editing ? (
                        <button onClick={() => setEditing(true)} className="btn-edit">
                          <FiEdit2 /> Editar Perfil
                        </button>
                      ) : (
                        <div className="edit-actions">
                          <button onClick={saveProfile} disabled={loading} className="btn-save">
                            <FiSave /> {loading ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button onClick={() => { setEditing(false); setForm(user); }} className="btn-cancel">
                            <FiX /> Cancelar
                          </button>
                        </div>
                      )}
                    </div>

                    <h1>{user.nome}</h1>
                    <p className="user-type">{tipoUsuario === 'academia' ? 'Academia' : tipoUsuario === 'personal' ? 'Personal Trainer' : 'Aluno'}</p>
                    
                    <div className="contact-info">
                      <p><Mail size={16} /> {user.email}</p>
                      <p><Phone size={16} /> {user.numTel || user.telefone}</p>
                    </div>
                  </div>

                  {/* Formulário de Edição */}
                  {editing && (
                    <div className="edit-form">
                      <div className="form-section">
                        <h3>Informações Pessoais</h3>
                        
                        <div className="form-grid">
                          <div className="input-group">
                            <label><User size={16} /> Nome Completo</label>
                            <input
                              type="text"
                              name="nome"
                              value={form.nome || ''}
                              onChange={handleChange}
                              placeholder="Nome completo"
                            />
                          </div>

                          <div className="input-group">
                            <label><Calendar size={16} /> Data Nascimento</label>
                            <input
                              type="date"
                              name="data_nascimento"
                              value={form.data_nascimento || ''}
                              onChange={handleChange}
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </div>

                          <div className="input-group">
                            <label><Users size={16} /> Gênero</label>
                            <select
                              name="genero"
                              value={form.genero || ''}
                              onChange={handleChange}
                            >
                              <option value="">Selecione</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Feminino">Feminino</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>
                        </div>

                        {/* Campos específicos por tipo de usuário */}
                        {tipoUsuario === 'aluno' && renderCamposAluno()}
                        {tipoUsuario === 'personal' && renderCamposPersonal()}
                        {tipoUsuario === 'academia' && renderCamposAcademia()}
                      </div>

                      {/* Seção de Endereço */}
                      <div className="form-section">
                        <h3><MapPin size={16} /> Endereço</h3>
                        <div className="form-grid">
                          <div className="input-group">
                            <label>CEP</label>
                            <input
                              type="text"
                              name="cep"
                              value={endereco.cep || ''}
                              onChange={handleEnderecoChange}
                              placeholder="00000-000"
                            />
                          </div>

                          <div className="input-group full-width">
                            <label>Logradouro</label>
                            <input
                              type="text"
                              name="logradouro"
                              value={endereco.logradouro || ''}
                              onChange={handleEnderecoChange}
                              placeholder="Rua, Avenida, etc."
                            />
                          </div>

                          <div className="input-group">
                            <label>Número</label>
                            <input
                              type="text"
                              name="numero"
                              value={endereco.numero || ''}
                              onChange={handleEnderecoChange}
                              placeholder="Nº"
                            />
                          </div>

                          <div className="input-group">
                            <label>Complemento</label>
                            <input
                              type="text"
                              name="complemento"
                              value={endereco.complemento || ''}
                              onChange={handleEnderecoChange}
                              placeholder="Apto, Casa, etc."
                            />
                          </div>

                          <div className="input-group">
                            <label>Bairro</label>
                            <input
                              type="text"
                              name="bairro"
                              value={endereco.bairro || ''}
                              onChange={handleEnderecoChange}
                              placeholder="Bairro"
                            />
                          </div>

                          <div className="input-group">
                            <label>Cidade</label>
                            <input
                              type="text"
                              name="cidade"
                              value={endereco.cidade || ''}
                              onChange={handleEnderecoChange}
                              placeholder="Cidade"
                            />
                          </div>

                          <div className="input-group">
                            <label>Estado</label>
                            <select
                              name="estado"
                              value={endereco.estado || ''}
                              onChange={handleEnderecoChange}
                            >
                              <option value="">Selecione</option>
                              <option value="SP">SP - São Paulo</option>
                              <option value="RJ">RJ - Rio de Janeiro</option>
                              <option value="MG">MG - Minas Gerais</option>
                              <option value="ES">ES - Espírito Santo</option>
                              <option value="RS">RS - Rio Grande do Sul</option>
                              <option value="PR">PR - Paraná</option>
                              <option value="SC">SC - Santa Catarina</option>
                              <option value="BA">BA - Bahia</option>
                              <option value="PE">PE - Pernambuco</option>
                              <option value="CE">CE - Ceará</option>
                              <option value="GO">GO - Goiás</option>
                              <option value="DF">DF - Distrito Federal</option>
                              <option value="PA">PA - Pará</option>
                              <option value="AM">AM - Amazonas</option>
                              <option value="MT">MT - Mato Grosso</option>
                              <option value="MS">MS - Mato Grosso do Sul</option>
                              <option value="AL">AL - Alagoas</option>
                              <option value="SE">SE - Sergipe</option>
                              <option value="PB">PB - Paraíba</option>
                              <option value="RN">RN - Rio Grande do Norte</option>
                              <option value="MA">MA - Maranhão</option>
                              <option value="PI">PI - Piauí</option>
                              <option value="RO">RO - Rondônia</option>
                              <option value="AC">AC - Acre</option>
                              <option value="AP">AP - Amapá</option>
                              <option value="RR">RR - Roraima</option>
                              <option value="TO">TO - Tocantins</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Seção de Modalidades */}
                      <div className="form-section">
                        <h3>
                          {tipoUsuario === 'personal' ? 'Modalidades que Trabalha' : 
                          tipoUsuario === 'academia' ? 'Modalidades Oferecidas' : 'Modalidades de Interesse'} *
                        </h3>
                        
                        {modalidades.length > 0 ? (
                          <div className="modalidades-grid">
                            {modalidades.map(modalidade => (
                              <label key={modalidade.idModalidade} className="modalidade-checkbox">
                                <input
                                  type="checkbox"
                                  checked={isModalidadeSelecionada(modalidade.idModalidade)}
                                  onChange={() => handleModalidadeChange(modalidade.idModalidade)}
                                  disabled={!editing}
                                />
                                <span className="checkmark"></span>
                                {modalidade.nome}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="loading-modalidades">
                            <p>Carregando modalidades...</p>
                          </div>
                        )}
                        
                        {editing && (!form.modalidades || form.modalidades.length === 0) && (
                          <span className="cad-error">Selecione pelo menos uma modalidade</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Visualização do Perfil (não editando) */}
                  {!editing && (
                    <div className="profile-view">
                      <div className="info-section">
                        <h3>Informações Pessoais</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <strong>Nome:</strong> {user.nome}
                          </div>
                          <div className="info-item">
                            <strong>Email:</strong> {user.email}
                          </div>
                          <div className="info-item">
                            <strong>Telefone:</strong> {user.numTel || user.telefone}
                          </div>
                          
                          {/* 🔥 CORREÇÃO: Data de nascimento formatada corretamente */}
                          {user.data_nascimento && (
                            <div className="info-item">
                              <strong>Data Nascimento:</strong> {new Date(user.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          
                          {user.genero && (
                            <div className="info-item">
                              <strong>Gênero:</strong> {user.genero}
                            </div>
                          )}
                          
                          {/* 🔥 CORREÇÃO: Informações específicas para ALUNO */}
                          {tipoUsuario === 'aluno' && (
                            <>
                              {user.altura && (
                                <div className="info-item">
                                  <strong>Altura:</strong> {user.altura}cm
                                </div>
                              )}
                              {user.peso && (
                                <div className="info-item">
                                  <strong>Peso:</strong> {user.peso}kg
                                </div>
                              )}
                              {user.meta && (
                                <div className="info-item">
                                  <strong>Meta:</strong> {user.meta}
                                </div>
                              )}
                              {user.treinoTipo && (
                                <div className="info-item">
                                  <strong>Nível de Atividade:</strong> {user.treinoTipo}
                                </div>
                              )}
                              {user.treinos_adaptados !== undefined && (
                                <div className="info-item">
                                  <strong>Treinos Adaptados:</strong> {user.treinos_adaptados ? 'Sim' : 'Não'}
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* 🔥 CORREÇÃO: Informações específicas para PERSONAL */}
                          {tipoUsuario === 'personal' && (
                            <>
                              {user.cref_numero && (
                                <div className="info-item">
                                  <strong>CREF:</strong> {user.cref_numero}-{user.cref_categoria}/{user.cref_regional}
                                </div>
                              )}
                              {user.treinos_adaptados !== undefined && (
                                <div className="info-item">
                                  <strong>Trabalha com Treinos Adaptados:</strong> {user.treinos_adaptados ? 'Sim' : 'Não'}
                                </div>
                              )}
                              {user.sobre && (
                                <div className="info-item full-width">
                                  <strong>Sobre:</strong> {user.sobre}
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* 🔥 CORREÇÃO: Informações específicas para ACADEMIA */}
                          {tipoUsuario === 'academia' && (
                            <>
                              {user.cnpj && (
                                <div className="info-item">
                                  <strong>CNPJ:</strong> {user.cnpj}
                                </div>
                              )}
                              {user.nome_fantasia && (
                                <div className="info-item">
                                  <strong>Nome Fantasia:</strong> {user.nome_fantasia}
                                </div>
                              )}
                              {user.razao_social && (
                                <div className="info-item">
                                  <strong>Razão Social:</strong> {user.razao_social}
                                </div>
                              )}
                              {user.tamanho_estrutura && (
                                <div className="info-item">
                                  <strong>Tamanho da Estrutura:</strong> {user.tamanho_estrutura}
                                </div>
                              )}
                              {user.capacidade_maxima && (
                                <div className="info-item">
                                  <strong>Capacidade Máxima:</strong> {user.capacidade_maxima} alunos
                                </div>
                              )}
                              {user.ano_fundacao && (
                                <div className="info-item">
                                  <strong>Ano de Fundação:</strong> {user.ano_fundacao}
                                </div>
                              )}
                              {user.sobre && (
                                <div className="info-item full-width">
                                  <strong>Sobre:</strong> {user.sobre}
                                </div>
                              )}
                              
                              {/* Diferenciais da Academia */}
                              {(user.estacionamento || user.vestiario || user.ar_condicionado || user.wifi || 
                                user.totem_de_carregamento_usb || user.area_descanso || user.avaliacao_fisica) && (
                                <div className="info-item full-width">
                                  <strong>Diferenciais:</strong>
                                  <div className="diferenciais-list">
                                    {user.estacionamento && <span className="diferencial-tag">Estacionamento</span>}
                                    {user.vestiario && <span className="diferencial-tag">Vestiário</span>}
                                    {user.ar_condicionado && <span className="diferencial-tag">Ar Condicionado</span>}
                                    {user.wifi && <span className="diferencial-tag">Wi-Fi</span>}
                                    {user.totem_de_carregamento_usb && <span className="diferencial-tag">Totem USB</span>}
                                    {user.area_descanso && <span className="diferencial-tag">Área de Descanso</span>}
                                    {user.avaliacao_fisica && <span className="diferencial-tag">Avaliação Física</span>}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* 🔥 CORREÇÃO: Endereço - usando dados do usuário completo */}
                      {(user.cep || endereco.cep) && (
                        <div className="info-section">
                          <h3>Endereço</h3>
                          <div className="info-grid">
                            {(user.logradouro || endereco.logradouro) && (
                              <div className="info-item2">
                                <strong>Endereço:</strong> <br /> {(user.logradouro || endereco.logradouro)}, {(user.numero || endereco.numero)} {(user.complemento || endereco.complemento) && `- ${user.complemento || endereco.complemento}`}
                              </div>
                            )}
                            {(user.bairro || endereco.bairro) && (
                              <div className="info-item2">
                                <strong>Bairro:</strong> <br /> {user.bairro || endereco.bairro}
                              </div>
                            )}
                            {(user.cidade || endereco.cidade) && (
                              <div className="info-item2">
                                <strong>Cidade/Estado:</strong> <br /> {user.cidade || endereco.cidade} - {user.estado || endereco.estado}
                              </div>
                            )}
                            {(user.cep || endereco.cep) && (
                              <div className="info-item2">
                                <strong>CEP:</strong> <br /> {user.cep || endereco.cep}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 🔥 CORREÇÃO: Modalidades - usando dados corretos */}
                      {user.modalidades && user.modalidades.length > 0 && (
                      <div className="row2">
                        <div className="col-lg-6 info-section">
                          <h3>Modalidades</h3>
                          <div className="modalidades-tags">
                            {user.modalidades.map((modalidade, index) => {
                              // Se modalidade é um objeto, usar nome, se é ID, buscar na lista
                              if (typeof modalidade === 'object' && modalidade.nome) {
                                return (
                                  <span key={index} className="modalidade-tag">
                                    {modalidade.nome}
                                  </span>
                                );
                              } else {
                                // Buscar nome da modalidade na lista carregada
                                const modalidadeInfo = modalidades.find(m => 
                                  m.idModalidade.toString() === modalidade.toString()
                                );
                                return (
                                  <span key={index} className="modalidade-tag">
                                    {modalidadeInfo ? modalidadeInfo.nome : `Modalidade ${modalidade}`}
                                  </span>
                                );
                              }
                            })}
                          </div>
                        </div>
                        {/* 🔥 CORREÇÃO: Plano */}
                        <div className="col-lg-6 info-section">
                          <h3>Plano</h3>
                          <div className="plan-info">
                            <div className="info-item2">
                              <strong>Plano Atual:</strong> {user.tipoPlano || 'Básico(Gratuito)'}
                            </div>
                            <button 
                              onClick={() => setEditingPlan(true)}
                              className="btn-change-plan"
                            >
                              Alterar Plano
                            </button>
                          </div>
                        </div>
                      </div>
                      )}
                      
                      {/* 🔥 CORREÇÃO: Solicitação de Vinculação à Academia */}
                      {tipoUsuario !== 'academia' && user.idAcademia && (
                        <div className="info-section solicitation-info">
                          <h3>🏢 Academia Vinculada</h3>
                          <div className="solicitation-status">
                            <div className="status-item approved">
                              <strong>Status:</strong> Vinculado
                            </div>
                            <div className="status-item">
                              <strong>Academia:</strong> {
                                academias.find(a => a.idAcademia == user.idAcademia)?.nome || 'Academia vinculada'
                              }
                            </div>
                            <div className="status-help">
                              <small>
                                Você está vinculado a esta academia. Para alterar, entre em contato com a administração.
                              </small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 🔥 NOVO: Botão para solicitar vinculação se não tiver academia */}
                      {tipoUsuario !== 'academia' && !user.idAcademia && academias.length > 0 && (
                        <div className="info-section solicitation-info">
                          <h3>🏢 Vincular-se a uma Academia</h3>
                          <div className="solicitation-status">
                            <div className="status-item pending">
                              <strong>Status:</strong> Não vinculado
                            </div>
                            <div className="status-help">
                              <small>
                                Você não está vinculado a nenhuma academia. Clique em "Editar Perfil" para solicitar vinculação.
                              </small>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Histórico de Treinos (apenas para alunos) */}
            {tipoUsuario === 'aluno' && (
              <div className="clips">
                <div className="col-lg-12">
                  <div className="heading-section">
                    <h4><Dumbbell size={20} /> Histórico de Treinos (Último Mês)</h4>
                  </div>
                </div>
                
                {loadingHistorico ? (
                  <div className="loading">Carregando histórico...</div>
                ) : historicoTreinos.length > 0 ? (
                  <div className="row">
                    {historicoTreinos.map((treino, idx) => (
                      <div className="col-lg-3 col-sm-6" key={idx}>
                        <div 
                          className="item treino-card"
                          onClick={() => handleCardClick(treino)}
                        >
                          <div className="treino-header">
                            <h5>{treino.nome_treino}</h5>
                            <span className={`status ${treino.porcentagem_concluida >= 90 ? 'completed' : 'in-progress'}`}>
                              {treino.porcentagem_concluida >= 90 ? 'Concluído' : 'Em Progresso'}
                            </span>
                          </div>
                          <div className="treino-info">
                            <p><strong>Data:</strong> {treino.data_formatada}</p>
                            <p><strong>Tipo:</strong> {treino.tipo_display}</p>
                            {treino.porcentagem_concluida < 100 && (
                              <p><strong>Progresso:</strong> {treino.porcentagem_concluida}%</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Nenhum treino recente.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {cropModalOpen && (
        <CropModal
          onClose={() => setCropModalOpen(false)}
          onSave={handleSaveCrop}
        />
      )}

      {editingPlan && (
        <PlanModal
          onClose={() => setEditingPlan(false)}
          onRemovePersonal={() => {
            setUser(prev => ({ ...prev, idPersonal: null, personal_nome: null }));
            setForm(prev => ({ ...prev, idPersonal: null, personal_nome: null }));
          }}
          onChoosePlan={(planName) => {
            setUser(prev => ({ ...prev, tipoPlano: planName }));
            setEditingPlan(false);
          }}
        />
      )}
    </div>
  );
}