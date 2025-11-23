import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { X } from "lucide-react";
import "./modalCrop.css";

const CropModal = ({ imagem, onClose, onSave, loading = false }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imagemCarregada, setImagemCarregada] = useState(false);

  // 🔥 CORREÇÃO: Verificar se a imagem está carregada
  useEffect(() => {
    if (imagem) {
      setImagemCarregada(true);
    }
  }, [imagem]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imagem || !croppedAreaPixels) {
      alert('Por favor, ajuste a imagem primeiro.');
      return;
    }
    
    try {
      // Passar apenas as coordenadas do crop para o componente pai
      onSave(croppedAreaPixels);
    } catch (e) {
      console.error('Erro ao processar imagem:', e);
      alert('Erro ao processar imagem. Tente novamente.');
    }
  };

  // 🔥 CORREÇÃO: Se não há imagem, mostrar estado de carregamento
  if (!imagem) {
    return (
      <div className="crop-modal-overlay">
        <div className="crop-modal-container">
          <div className="crop-modal-header">
            <h3>Carregando...</h3>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="crop-modal-content">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Carregando imagem...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container">
        <div className="crop-modal-header">
          <h3>{loading ? "Salvando Imagem..." : "Cortar Imagem de Perfil"}</h3>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="crop-modal-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Processando imagem...</p>
            </div>
          ) : (
            <>
              <div className="crop-container">
                <Cropper
                  image={imagem}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="controls">
                <label>Zoom:</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="zoom-slider"
                />
                <span>{zoom.toFixed(1)}x</span>
              </div>
            </>
          )}
        </div>

        <div className="crop-modal-actions">
          {!loading && (
            <div className="action-buttons">
              <button className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSave}>
                Salvar Foto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropModal;