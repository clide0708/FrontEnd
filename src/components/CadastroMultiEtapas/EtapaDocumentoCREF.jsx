// components/CadastroMultiEtapas/EtapaDocumentoCREF.jsx
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";

const EtapaDocumentoCREF = ({ dados, onChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('Formato não suportado. Use JPG, PNG ou PDF.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    setUploading(true);

    try {
      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      }

      // Fazer upload para o servidor
      const formData = new FormData();
      formData.append('cref_documento', file);
      formData.append('cref_numero', dados.cref_numero || 'temp');

      console.log('📤 Iniciando upload do documento CREF...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}upload/cref-documento`, {
        method: 'POST',
        body: formData,
        // 🔥 CORREÇÃO: Não enviar headers de autenticação durante cadastro
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro no upload:', errorText);
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Resposta do upload:', result);

      if (result.success) {
        onChange({ 
          cref_foto_url: result.url,
          cref_documento_nome: result.nome_arquivo 
        });
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('❌ Erro completo no upload:', error);
      alert('Erro ao fazer upload do documento: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = () => {
    setPreviewUrl(null);
    onChange({ 
      cref_foto_url: null,
      cref_documento_nome: null 
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="etapa-documento-cref">
      <label>Documento do CREF</label>
      <p>Envie uma foto ou scan do seu CREF para verificação</p>

      <div className="document-upload-area">
        <div className="upload-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf"
            className="file-input"
            id="cref-document"
            disabled={uploading}
          />
          
          <label htmlFor="cref-document" className="upload-label">
            {uploading ? (
              <div className="upload-loading">
                <div className="spinner"></div>
                <span>Enviando documento...</span>
              </div>
            ) : dados.cref_foto_url ? (
              <div className="document-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Documento CREF" className="preview-image" />
                ) : (
                  <div className="document-preview-placeholder">
                    <CheckCircle size={48} color="#4CAF50" />
                    <span>Documento enviado com sucesso</span>
                    <small>{dados.cref_documento_nome}</small>
                  </div>
                )}
                <button 
                  type="button" 
                  className="remove-document-btn"
                  onClick={handleRemoveDocument}
                  disabled={uploading}
                >
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <Upload size={48} />
                <span>Clique para enviar o documento do CREF</span>
                <small>Formatos: JPG, PNG, PDF (até 5MB)</small>
              </div>
            )}
          </label>
        </div>

        <div className="upload-requirements">
          <label>Requisitos do documento:</label>
          <ul>
            <li>✓ Documento oficial do CREF</li>
            <li>✓ Foto ou scan legível</li>
            <li>✓ Número, categoria e regional visíveis</li>
            <li>✓ Situação "ATIVA" ou "REGULAR"</li>
            <li>✓ Data de validade (se aplicável)</li>
          </ul>
        </div>

        {dados.cref_foto_url && (
          <div className="upload-success">
            <CheckCircle size={16} />
            <span>Documento enviado para análise. Verificação em até 48h.</span>
          </div>
        )}
      </div>

      <div className="info-important">
        <label>⚠️ Importante:</label>
        <p>
          Sua conta ficará com status "Pendente" até a verificação do CREF. 
          Você poderá acessar a plataforma, mas algumas funcionalidades ficarão 
          limitadas até a aprovação.
        </p>
      </div>
    </div>
  );
};

export default EtapaDocumentoCREF;