/**
 * Utilitário para gerar URLs dinâmicas de imagens - VERSÃO CORRIGIDA
 */

class ImageUrlHelper {
  static getBaseUrl() {
    // 🔥 CORREÇÃO: Sempre usar a URL da API em produção
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    // Remove barras extras no final
    return apiUrl.replace(/\/+$/, '');
  }

  /**
   * Constrói URL completa para imagens de upload
   * CORREÇÃO: Garantir URL absoluta correta
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
    
    // 🔥 CORREÇÃO: Se o caminho já começa com assets, concatena corretamente
    if (imagePath.startsWith('assets/')) {
      return `${baseUrl}/${imagePath}`;
    }
    
    // 🔥 CORREÇÃO: Se começa com /assets, remove a barra inicial
    if (imagePath.startsWith('/assets/')) {
      const cleanPath = imagePath.substring(1);
      return `${baseUrl}/${cleanPath}`;
    }
    
    // 🔥 CORREÇÃO: Se é apenas o nome do arquivo
    if (!imagePath.includes('/')) {
      return `${baseUrl}/assets/images/uploads/${imagePath}`;
    }
    
    // Para outros casos, assume que é um caminho relativo
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
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