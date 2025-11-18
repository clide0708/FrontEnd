import { useState, useEffect } from "react";
import { Calendar, Ruler, Target, Users, Upload, X, Building } from "lucide-react";
import CropModal from "../../pages/Perfil/modalCrop";
import getCroppedImg from "../../utils/cropImage";
import { uploadImagemParaServidor, blobParaDataURL, deletarFotoServidor } from "../../utils/uploadImage";
import HorariosAcademia from "./HorariosAcademia";

const EtapaPerfil = ({ dados, onChange, tipoUsuario }) => {
  const [modalidades, setModalidades] = useState([]);
  const [cropModalAberto, setCropModalAberto] = useState(false);
  const [imagemParaCortar, setImagemParaCortar] = useState(null);
  const [salvandoImagem, setSalvandoImagem] = useState(false);
  const [carregandoModalidades, setCarregandoModalidades] = useState(false);
  
  useEffect(() => {
    carregarModalidades();
  }, []);

  const carregarModalidades = async () => {
    setCarregandoModalidades(true);
    try {
      // CORRIGIDO: Remove /api/ da URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}cadastro/modalidades`);
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Se não for JSON, usar fallback
        console.warn('Resposta não é JSON, usando modalidades padrão');
        setModalidades(getModalidadesPadrao());
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setModalidades(data.data || []);
      } else {
        console.error('Erro na resposta:', data.error);
        setModalidades(getModalidadesPadrao());
      }
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
      // Fallback com modalidades básicas
      setModalidades(getModalidadesPadrao());
    } finally {
      setCarregandoModalidades(false);
    }
  };

  const getModalidadesPadrao = () => {
    console.log('🔄 Carregando modalidades padrão...');
    return [
      { idModalidade: 1, nome: 'Musculação' },
      { idModalidade: 2, nome: 'CrossFit' },
      { idModalidade: 3, nome: 'Calistenia' },
      { idModalidade: 4, nome: 'Boxe' },
      { idModalidade: 5, nome: 'Muay Thai' },
      { idModalidade: 6, nome: 'Jiu-Jitsu' },
      { idModalidade: 7, nome: 'Judô' },
      { idModalidade: 8, nome: 'Karatê' },
      { idModalidade: 9, nome: 'Natação' },
      { idModalidade: 10, nome: 'Hidroginástica' },
      { idModalidade: 11, nome: 'Pilates' },
      { idModalidade: 12, nome: 'Yoga' },
      { idModalidade: 13, nome: 'Dança' },
      { idModalidade: 14, nome: 'Zumba' },
      { idModalidade: 15, nome: 'Spinning' },
      { idModalidade: 16, nome: 'Treinamento Funcional' },
      { idModalidade: 17, nome: 'Corrida' },
      { idModalidade: 18, nome: 'Ciclismo' },
      { idModalidade: 19, nome: 'Treinamento em Suspensão' },
      { idModalidade: 20, nome: 'Levantamento de Peso Olímpico' }
    ];
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleSelecionarFoto = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagemParaCortar(e.target.result);
      setCropModalAberto(true);
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleSalvarCorte = async (pixelCrop) => {
    if (!imagemParaCortar || !pixelCrop) return;
    
    setSalvandoImagem(true);
    
    try {
      // 1. Cortar imagem
      const blob = await getCroppedImg(imagemParaCortar, pixelCrop);
      
      // 2. Fazer upload IMEDIATO usando UploadController
      const formData = new FormData();
      formData.append('foto', blob, `perfil_${Date.now()}.jpg`);

      console.log('📤 Fazendo upload da imagem...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}upload/foto-perfil`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('✅ Resposta do upload:', result);

      if (result.success) {
        // 3. Criar preview local para exibição imediata
        const previewUrl = URL.createObjectURL(blob);
        
        // 4. Atualizar dados com URL do servidor E preview local
        onChange({ 
          foto_url: result.url,
          foto_nome: result.nome_arquivo,
          foto_data: previewUrl, // 🔥 CORREÇÃO: Adicionar preview local
          foto_fallback: false
        });
        
        console.log('✅ Foto salva no servidor:', result.url);
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      alert('Erro ao salvar imagem: ' + error.message);
    } finally {
      setSalvandoImagem(false);
      setCropModalAberto(false);
      setImagemParaCortar(null);
    }
  };

  const removerFoto = async () => {
    if (dados.foto_nome && !dados.foto_fallback) {
      try {
        await deletarFotoServidor(dados.foto_nome);
      } catch (error) {
        console.error('Erro ao deletar foto do servidor:', error);
      }
    }

    onChange({ 
      foto_url: '', 
      foto_data: null,
      foto_nome: '',
      foto_fallback: false
    });
  };

  const handleModalidadeChange = (idModalidade) => {
    const novasModalidades = dados.modalidades?.includes(idModalidade.toString())
      ? dados.modalidades.filter(id => id !== idModalidade.toString())
      : [...(dados.modalidades || []), idModalidade.toString()];
    
    console.log('🎯 Modalidades atualizadas:', novasModalidades);
    console.log('🔍 Tipo das modalidades:', typeof novasModalidades);
    
    onChange({ modalidades: novasModalidades });
  };

  const handleHorariosChange = (novosHorarios) => {
    onChange({ horarios: novosHorarios });
  };

  // Campos específicos para academia
  const estruturas = [
    { value: 'Pequena', label: 'Pequena (até 100m²)' },
    { value: 'Média', label: 'Média (100-300m²)' },
    { value: 'Grande', label: 'Grande (300-600m²)' },
    { value: 'Muito grande', label: 'Muito Grande (+600m²)' }
  ];

  return (
    <div className="etapa-perfil">
      <h2>{tipoUsuario === 'academia' ? 'Perfil da Academia' : 'Seu Perfil'}</h2>
      <p>{tipoUsuario === 'academia' ? 'Complete as informações da sua academia' : 'Complete suas informações pessoais'}</p>

      {/* Modal de Corte */}
      {cropModalAberto && (
        <CropModal
          imagem={imagemParaCortar}
          onClose={() => {
            setCropModalAberto(false);
            setImagemParaCortar(null);
          }}
          onSave={handleSalvarCorte}
          loading={salvandoImagem}
        />
      )}

      {/* Upload de Foto */}
      <div className="foto-perfil-section">
        <label className="foto-label">
          {tipoUsuario === 'academia' ? <Building size={20} /> : <Users size={20} />}
          {tipoUsuario === 'academia' ? 'Foto da Academia *' : 'Foto de Perfil (Opcional)'}
        </label>
        
        <div className="foto-container">
          {dados.foto_data || dados.foto_url ? ( // 🔥 CORREÇÃO: Verificar ambos
            <div className="foto-preview">
              <img src={dados.foto_data || dados.foto_url} alt="Preview" /> {/* 🔥 CORREÇÃO */}
              <button type="button" className="btn-remover-foto" onClick={removerFoto}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="foto-placeholder">
              {tipoUsuario === 'academia' ? <Building size={40} /> : <Users size={40} />}
              <span>
                {tipoUsuario === 'academia' 
                  ? 'Clique para adicionar foto da academia' 
                  : 'Clique para adicionar foto'
                }
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelecionarFoto}
                className="foto-input"
              />
            </label>
          )}
        </div>
        
        <p className="foto-instructions">
          Formatos: JPG, PNG, GIF, WebP • Máximo: 5MB
        </p>
      </div>

      {/* Formulário específico para academia */}
      {tipoUsuario === 'academia' && (
        <>
          <div className="form-grid">
            {/* Tamanho da Estrutura */}
            <div className="input-group">
              <label>Tamanho da Estrutura</label>
              <select
                className="cad-input-global"
                value={dados.tamanho_estrutura || ''}
                onChange={(e) => onChange({ tamanho_estrutura: e.target.value })}
              >
                <option value="">Selecione o tamanho</option>
                {estruturas.map(estrutura => (
                  <option key={estrutura.value} value={estrutura.value}>
                    {estrutura.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacidade Máxima */}
            <div className="input-group">
              <label>Capacidade Máxima (alunos)</label>
              <input
                type="number"
                min="1"
                max="1000"
                placeholder="Ex: 150"
                className="cad-input-global"
                value={dados.capacidade_maxima || ''}
                onChange={(e) => onChange({ capacidade_maxima: e.target.value })}
              />
            </div>

            {/* Ano de Fundação */}
            <div className="input-group">
              <label>Ano de Fundação</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Ex: 2010"
                className="cad-input-global"
                value={dados.ano_fundacao || ''}
                onChange={(e) => onChange({ ano_fundacao: e.target.value })}
              />
            </div>
          </div>

          {/* Horários de Funcionamento */}
          <HorariosAcademia 
            horarios={dados.horarios || []}
            onChange={handleHorariosChange}
          />

          {/* Diferenciais da Academia */}
          <div className="checkbox-group full-width">
            <label className="section-label">Diferenciais da Academia</label>
            <div className="diferenciais-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dados.estacionamento || false}
                  onChange={(e) => onChange({ estacionamento: e.target.checked })}
                />
                <span className="checkmark"></span>
                Estacionamento
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dados.vestiario || false}
                  onChange={(e) => onChange({ vestiario: e.target.checked })}
                />
                <span className="checkmark"></span>
                Vestiário
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dados.ar_condicionado || false}
                  onChange={(e) => onChange({ ar_condicionado: e.target.checked })}
                />
                <span className="checkmark"></span>
                Ar Condicionado
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dados.wifi || false}
                  onChange={(e) => onChange({ wifi: e.target.checked })}
                />
                <span className="checkmark"></span>
                Wi-Fi
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dados.totem_de_carregamento_usb || false}
                  onChange={(e) => onChange({ totem_de_carregamento_usb: e.target.checked })}
                />
                <span className="checkmark"></span>
                Totem de Carregamento USB
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dados.area_descanso || false}
                  onChange={(e) => onChange({ area_descanso: e.target.checked })}
                />
                <span className="checkmark"></span>
                Área de Descanso
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dados.avaliacao_fisica || false}
                  onChange={(e) => onChange({ avaliacao_fisica: e.target.checked })}
                />
                <span className="checkmark"></span>
                Avaliação Física
              </label>
            </div>
          </div>

          {/* Sobre - OPCIONAL para academia */}
          <div className="input-group full-width">
            <label>Sobre a Academia (Opcional)</label>
            <textarea
              placeholder="Conte sobre sua academia: equipamentos disponíveis, metodologia de trabalho, diferenciais, estrutura física, profissionais qualificados, ambiente..."
              className="cad-input-global"
              value={dados.sobre || ''}
              onChange={(e) => onChange({ sobre: e.target.value })}
              rows={6}
              maxLength={1000}
            />
            <div className="caracteres-restantes">
              {dados.sobre?.length || 0}/1000 caracteres
            </div>
          </div>
        </>
      )}

      {/* Apenas para alunos e personais - manter campos existentes */}
      {tipoUsuario !== 'academia' && (
        <>
          <div className="form-grid">
            {/* Data de Nascimento */}
            <div className="input-group">
              <label>
                <Calendar size={16} />
                Data de Nascimento *
              </label>
              <input
                type="date"
                className="cad-input-global"
                value={dados.data_nascimento || ''}
                onChange={(e) => onChange({ data_nascimento: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {dados.data_nascimento && (
                <span className="idade-calculada">
                  {calcularIdade(dados.data_nascimento)} anos
                </span>
              )}
            </div>

            {/* Gênero */}
            <div className="input-group">
              <label>Gênero *</label>
              <select
                className="cad-input-global"
                value={dados.genero || ''}
                onChange={(e) => onChange({ genero: e.target.value })}
                required
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Altura (apenas alunos) */}
            {tipoUsuario === 'aluno' && (
              <div className="input-group">
                <label>
                  <Ruler size={16} />
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  placeholder="Ex: 175"
                  className="cad-input-global"
                  value={dados.altura || ''}
                  onChange={(e) => onChange({ altura: e.target.value })}
                />
              </div>
            )}

            {/* Meta (apenas alunos) */}
            {tipoUsuario === 'aluno' && (
              <div className="input-group">
                <label>
                  <Target size={16} />
                  Sua Meta Principal
                </label>
                <select
                  className="cad-input-global"
                  value={dados.meta || ''}
                  onChange={(e) => onChange({ meta: e.target.value })}
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
            )}
          </div>

          {/* Sobre (apenas personal) */}
          {tipoUsuario === 'personal' && (
            <div className="input-group full-width">
              <label>Sobre Você</label>
              <textarea
                placeholder="Conte um pouco sobre sua experiência, metodologia de trabalho, especializações..."
                className="cad-input-global"
                value={dados.sobre || ''}
                onChange={(e) => onChange({ sobre: e.target.value })}
                rows={4}
                maxLength={500}
              />
              <div className="caracteres-restantes">
                {dados.sobre?.length || 0}/500 caracteres
              </div>
            </div>
          )}

          {/* Treinos Adaptados (apenas alunos e personais) */}
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={dados.treinos_adaptados || false}
                onChange={(e) => onChange({ treinos_adaptados: e.target.checked })}
              />
              <span className="checkmark"></span>
              {tipoUsuario === 'personal' 
                ? 'Trabalho com treinos adaptados' 
                : 'Preciso de treinos adaptados'
              }
            </label>
          </div>
        </>
      )}

      {/* Modalidades */}
      <div className="modalidades-section">
        <label>
          {tipoUsuario === 'personal' ? 'Modalidades que Trabalha' : 'Modalidades de Interesse'} *
        </label>
        
        {carregandoModalidades ? (
          <div className="loading-modalidades">
            <p>Carregando modalidades...</p>
          </div>
        ) : modalidades.length > 0 ? (
          <div className="modalidades-grid">
            {modalidades.map(modalidade => (
              <label key={modalidade.idModalidade} className="modalidade-checkbox">
                <input
                  type="checkbox"
                  checked={dados.modalidades?.includes(modalidade.idModalidade.toString()) || false}
                  onChange={() => handleModalidadeChange(modalidade.idModalidade)}
                />
                <span className="checkmark"></span>
                {modalidade.nome}
              </label>
            ))}
          </div>
        ) : (
          <div className="erro-modalidades">
            <p>Não foi possível carregar as modalidades. Tente novamente mais tarde.</p>
          </div>
        )}
        
        {dados.modalidades?.length === 0 && (
          <span className="cad-error">Selecione pelo menos uma modalidade</span>
        )}
      </div>
    </div>
  );
};

export default EtapaPerfil;