/**
 * Salvar imagem automaticamente no servidor
 */
export const salvarImagemLocalmente = async (blob, nomeArquivo = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Gerar nome único para o arquivo
      const nomeFinal = nomeArquivo || `perfil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('foto', blob, nomeFinal);

      console.log('📤 Iniciando upload da imagem...');

      // Fazer upload para o servidor
      const response = await fetch('/api/upload/foto-perfil', {
        method: 'POST',
        body: formData,
        // Não definir Content-Type - o browser vai definir automaticamente com boundary
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Upload realizado com sucesso:', result.nome_arquivo);
        
        // Gerar preview da imagem
        const dataURL = await blobParaDataURL(blob);
        
        resolve({
          url_relativa: result.url_relativa,
          nome_arquivo: result.nome_arquivo,
          blob: blob,
          data_url: dataURL
        });
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      
      // Fallback: usar blob URL se o upload falhar
      const urlBlob = URL.createObjectURL(blob);
      const nomeFinal = nomeArquivo || `perfil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const urlRelativa = `/assets/images/fotosPerfil/${nomeFinal}`;
      
      console.warn('⚠️ Usando fallback com blob URL');
      
      resolve({
        url_relativa: urlRelativa,
        nome_arquivo: nomeFinal,
        blob: blob,
        blob_url: urlBlob,
        data_url: await blobParaDataURL(blob),
        fallback: true
      });
    }
  });
};

/**
 * Deletar foto do servidor
 */
export const deletarFotoServidor = async (nomeArquivo) => {
  try {
    if (!nomeArquivo) return { success: true };

    const response = await fetch('/api/upload/foto-perfil', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome_arquivo: nomeArquivo })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gerar preview da imagem a partir do blob
 */
export const blobParaDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Verificar se a imagem existe no servidor
 */
export const verificarImagemExiste = async (urlRelativa) => {
  try {
    const response = await fetch(urlRelativa, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};