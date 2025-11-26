/**
 * Utilitário para gerar URLs dinâmicas de imagens - VERSÃO CORRIGIDA
 */

class ImageUrlHelper {
  static getBaseUrl() {
    // Remove /api do final da URL se existir
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return apiUrl.replace('/api', '');
  }

  /**
   * Constrói URL completa para imagens de upload
   * CORREÇÃO: Remove duplicação de caminhos
   */
  static buildImageUrl(imagePath) {
    if (!imagePath) {
      return this.getDefaultProfileImage();
    }

    // Se já é uma URL completa, retorna como está
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const baseUrl = this.getBaseUrl();
    
    // CORREÇÃO: Se o caminho já começa com /assets, usa diretamente
    if (imagePath.startsWith('/assets/')) {
      // Remove barra inicial para evitar dupla barra
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      return `${baseUrl}${cleanPath}`;
    }
    
    // CORREÇÃO: Se é apenas o nome do arquivo, constrói o caminho completo
    if (!imagePath.includes('/')) {
      return `${baseUrl}assets/images/uploads/${imagePath}`;
    }
    
    // Para outros casos, usa o caminho como está (já deve ser relativo completo)
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * URL para documentos CREF
   */
  static buildDocumentUrl(documentPath) {
    if (!documentPath) return null;
    
    // Se já é uma URL completa, retorna como está
    if (documentPath.startsWith('http')) {
      return documentPath;
    }

    const baseUrl = this.getBaseUrl();
    
    // CORREÇÃO: Para documentos CREF
    if (documentPath.startsWith('/assets/documents/')) {
      const cleanPath = documentPath.startsWith('/') ? documentPath.substring(1) : documentPath;
      return `${baseUrl}${cleanPath}`;
    }
    
    // Se é apenas o nome do arquivo
    if (!documentPath.includes('/')) {
      return `${baseUrl}assets/documents/cref/${documentPath}`;
    }
    
    const cleanPath = documentPath.startsWith('/') ? documentPath.substring(1) : documentPath;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Obtém apenas o nome do arquivo da URL
   */
  static getFilenameFromUrl(imageUrl) {
    if (!imageUrl) return null;
    return imageUrl.split('/').pop();
  }

  /**
   * URL da imagem de perfil padrão
   */
  static getDefaultProfileImage() {
    return '/assets/images/profilefoto.png';
  }

  /**
   * Verifica se a imagem existe (para fallback)
   */
  static async checkImageExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * URL para upload de imagens
   */
  static getUploadEndpoint() {
    return `${import.meta.env.VITE_API_URL}upload/foto-perfil`;
  }

  /**
   * URL para upload de documentos CREF
   */
  static getCrefUploadEndpoint() {
    return `${import.meta.env.VITE_API_URL}upload/cref-documento`;
  }
}

export default ImageUrlHelper;