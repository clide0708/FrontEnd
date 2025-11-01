import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage.js";
import "./style.css";

// USE ESTA VERSÃO - sintaxe correta
const CropModal = ({ imagem, onClose, onSave, loading = false }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imagem || !croppedAreaPixels) return;
    try {
      onSave(croppedAreaPixels);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modalCrop crop-modal-overlay">
      <div className="crop-modal">
        <h3>{loading ? "Salvando Imagem..." : "Cortar Imagem"}</h3>
        
        {!loading ? (
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
              />
              <span>{zoom.toFixed(1)}x</span>
            </div>
          </>
        ) : (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Preparando download da imagem...</p>
          </div>
        )}

        <div className="buttons">
          {!loading && (
            <>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={!imagem}
              >
                Cortar e Salvar
              </button>
              <button className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropModal;