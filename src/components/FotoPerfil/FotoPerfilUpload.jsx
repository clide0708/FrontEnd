import { useState } from "react";
import { Users, Upload, X } from "lucide-react";
import CropModal from "../pages/Perfil/modalCrop";
import getCroppedImg from "../utils/cropImage";
import { uploadImagemParaServidor, blobParaDataURL, deletarFotoServidor } from "../utils/uploadImage";

const FotoPerfilUpload = ({ 
  fotoUrl, 
  onFotoChange, 
  idUsuario, 
  tipoUsuario,
  tamanho = "medio" 
}) => {
  const [cropModalAberto, setCropModalAberto] = useState(false);
  const [imagemParaCortar, setImagemParaCortar] = useState(null);
  const [salvandoImagem, setSalvandoImagem] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(fotoUrl);

  const tamanhos = {
    pequeno: { container: "20%", icon: 24 },
    medio: { container: "30%", icon: 40 },
    grande: { container: "40%", icon: 60 }
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
      // Cortar imagem
      const blob = await getCroppedImg(imagemParaCortar, pixelCrop);
      
      // Fazer upload para o servidor
      const uploadResult = await uploadImagemParaServidor(blob);
      
      if (uploadResult.success) {
        // Gerar preview local
        const dataURL = await blobParaDataURL(blob);
        setFotoPreview(dataURL);
        
        // Chamar callback com os dados da foto
        onFotoChange({
          foto_url: uploadResult.url,
          foto_data: dataURL,
          foto_nome: uploadResult.nome_arquivo
        });

        console.log('✅ Foto processada e salva no servidor:', uploadResult.nome_arquivo);
        
      } else {
        throw new Error(uploadResult.error || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      alert('Erro ao salvar imagem. Tente novamente.');
    } finally {
      setSalvandoImagem(false);
      setCropModalAberto(false);
      setImagemParaCortar(null);
    }
  };

  const removerFoto = async () => {
    // Se tiver uma foto salva no servidor, tentar deletar
    if (fotoUrl && fotoUrl.includes('uploads/')) {
      const nomeArquivo = fotoUrl.split('/').pop();
      try {
        await deletarFotoServidor(nomeArquivo);
      } catch (error) {
        console.error('Erro ao deletar foto do servidor:', error);
      }
    }

    setFotoPreview(null);
    onFotoChange({
      foto_url: '',
      foto_data: null,
      foto_nome: ''
    });
  };

  return (
    <>
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
          <Upload size={20} />
          Foto de Perfil (Opcional)
        </label>
        
        <div 
          className="foto-container"
          style={{ 
            width: tamanhos[tamanho].container, 
            height: tamanhos[tamanho].container 
          }}
        >
          {fotoPreview ? (
            <div className="foto-preview">
              <img src={fotoPreview} alt="Preview" />
              <button type="button" className="btn-remover-foto" onClick={removerFoto}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="foto-placeholder">
              <Users size={tamanhos[tamanho].icon} />
              <span>Adicionar foto</span>
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
    </>
  );
};

export default FotoPerfilUpload;