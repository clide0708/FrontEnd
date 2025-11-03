import { useState, useEffect } from "react";
import { Calendar, Ruler, Target, Users, Upload, X } from "lucide-react";
import CropModal from "../../pages/Perfil/modalCrop";
import getCroppedImg from "../../utils/cropImage";
import { uploadImagemParaServidor, blobParaDataURL, deletarFotoServidor } from "../../utils/uploadImage";

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

  // Função auxiliar para modalidades padrão
  const getModalidadesPadrao = () => {
    return [
      { idModalidade: 1, nome: 'Musculação' },
      { idModalidade: 2, nome: 'Cardio' },
      { idModalidade: 3, nome: 'Yoga' },
      { idModalidade: 4, nome: 'Pilates' },
      { idModalidade: 5, nome: 'Crossfit' },
      { idModalidade: 6, nome: 'Artes Marciais' },
      { idModalidade: 7, nome: 'Dança' },
      { idModalidade: 8, nome: 'Natação' }
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

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Abrir modal de corte automaticamente
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagemParaCortar(e.target.result);
      setCropModalAberto(true);
    };
    reader.readAsDataURL(file);

    // Limpar input
    event.target.value = '';
  };

  const handleSalvarCorte = async (pixelCrop) => {
    if (!imagemParaCortar || !pixelCrop) return;
    
    setSalvandoImagem(true);
    
    try {
        const blob = await getCroppedImg(imagemParaCortar, pixelCrop);
        const uploadResult = await uploadImagemParaServidor(blob);
        
        if (uploadResult.success) {
            const dataURL = await blobParaDataURL(blob);
            onChange({ 
                foto_url: uploadResult.url,
                foto_data: dataURL,
                foto_nome: uploadResult.nome_arquivo
            });
            console.log('✅ Foto salva com sucesso');
        } else {
            // Se o upload falhar, use apenas o blob local
            const dataURL = await blobParaDataURL(blob);
            const nomeFinal = `perfil_local_${Date.now()}.jpg`;
            
            onChange({ 
                foto_url: dataURL, // Usar dataURL como fallback
                foto_data: dataURL,
                foto_nome: nomeFinal,
                foto_fallback: true
            });
            
            console.warn('⚠️ Upload falhou, usando imagem local');
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
    // Se tiver uma foto salva no servidor, tentar deletar
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
    
    onChange({ modalidades: novasModalidades });
  };

  const metas = [
    { value: 'Perder peso', label: 'Perder peso' },
    { value: 'Manter peso', label: 'Manter peso' },
    { value: 'Ganhar peso', label: 'Ganhar peso' },
    { value: 'Ganhar massa muscular', label: 'Ganhar massa muscular' },
    { value: 'Melhorar condicionamento', label: 'Melhorar condicionamento' },
    { value: 'Outro', label: 'Outro' }
  ];

  return (
    <div className="etapa-perfil">
      <h2>Seu Perfil</h2>
      <p>Complete suas informações pessoais</p>

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

      {/* Upload de Foto - OPICIONAL para todos os tipos */}
      <div className="foto-perfil-section">
        <label className="foto-label">
          <Upload size={20} />
          Foto de Perfil (Opcional)
        </label>
        
        <div className="foto-container">
          {dados.foto_data ? (
            <div className="foto-preview">
              <img src={dados.foto_data} alt="Preview" />
              <button type="button" className="btn-remover-foto" onClick={removerFoto}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="foto-placeholder">
              <Users size={40} />
              <span>Clique para adicionar foto</span>
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

      {/* Resto do formulário */}
      <div className="form-grid">
        {/* Data de Nascimento */}
        <div className="input-group">
          <label>
            <Calendar size={16} />
            Data de Nascimento *
          </label>
          <input
            type="date"
            value={dados.data_nascimento}
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
            value={dados.genero}
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
              value={dados.altura}
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
              value={dados.meta}
              onChange={(e) => onChange({ meta: e.target.value })}
            >
              <option value="">Selecione sua meta</option>
              {metas.map(meta => (
                <option key={meta.value} value={meta.value}>
                  {meta.label}
                </option>
              ))}
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
            value={dados.sobre}
            onChange={(e) => onChange({ sobre: e.target.value })}
            rows={4}
            maxLength={500}
          />
          <div className="caracteres-restantes">
            {dados.sobre?.length || 0}/500 caracteres
          </div>
        </div>
      )}
      
      {/* Sobre (apenas academia) */}
      {tipoUsuario === 'academia' && (
        <div className="input-group full-width">
          <label>Sobre a Academia</label>
          <textarea
            placeholder="Conte sobre sua academia, equipamentos, metodologia..."
            value={dados.sobre}
            onChange={(e) => onChange({ sobre: e.target.value })}
            rows={4}
            maxLength={500}
          />
        </div>
      )}

      {/* Treinos Adaptados */}
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