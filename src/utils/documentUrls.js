/**
 * Utilitário específico para documentos CREF
 */

import ImageUrlHelper from './imageUrls';

class DocumentUrlHelper {
  /**
   * Constrói URL completa para documentos CREF
   */
  static buildCrefDocumentUrl(documentPath) {
    if (!documentPath) return null;
    
    return ImageUrlHelper.buildDocumentUrl(documentPath);
  }

  /**
   * URL para upload de documentos CREF
   */
  static getCrefUploadEndpoint() {
    return ImageUrlHelper.getCrefUploadEndpoint();
  }

  /**
   * Verifica se o documento é uma imagem para preview
   */
  static isImageDocument(filename) {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => 
      filename.toLowerCase().includes(ext)
    );
  }

  /**
   * Obtém tipo do documento para ícone
   */
  static getDocumentType(filename) {
    if (!filename) return 'unknown';
    
    if (filename.toLowerCase().includes('.pdf')) return 'pdf';
    if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image';
    
    return 'document';
  }
}

export default DocumentUrlHelper;