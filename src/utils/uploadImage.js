/**
 * Upload de imagem para o servidor
 */
export const uploadImagemParaServidor = async (blob, nomeArquivo = null) => {
  try {
    const nomeFinal = nomeArquivo || `perfil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    const formData = new FormData();
    formData.append('foto', blob, nomeFinal);

    console.log('📤 Iniciando upload da imagem para:', `${import.meta.env.VITE_API_URL}upload/foto-perfil`);

    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/foto-perfil`, {
      method: 'POST',
      body: formData,
      // Não definir headers - o browser define automaticamente para FormData
    });

    console.log('📨 Resposta do servidor:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro detalhado:', errorText);
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Resultado do upload:', result);

    if (result.success) {
      return {
        success: true,
        url: result.url,
        nome_arquivo: result.nome_arquivo,
        message: result.message
      };
    } else {
      throw new Error(result.error || 'Erro no upload');
    }
    
  } catch (error) {
    console.error('❌ Erro completo no upload:', error);
    
    // Fallback mais robusto
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
};

/**
 * Salvar URL da foto no banco de dados do usuário
 */
export const salvarFotoNoBanco = async (idUsuario, tipoUsuario, fotoUrl) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/salvar-foto-usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idUsuario: idUsuario,
        tipoUsuario: tipoUsuario,
        foto_url: fotoUrl
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao salvar foto no banco:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obter foto atual do usuário
 */
export const obterFotoUsuario = async (idUsuario, tipoUsuario) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/obter-foto-usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idUsuario: idUsuario,
        tipoUsuario: tipoUsuario
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao obter foto do usuário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletar foto do servidor
 */
export const deletarFotoServidor = async (nomeArquivo) => {
  try {
    if (!nomeArquivo) return { success: true };

    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/deletar-foto`, {
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

// Exportação padrão para compatibilidade
export default {
  uploadImagemParaServidor,
  salvarFotoNoBanco,
  obterFotoUsuario,
  deletarFotoServidor,
  blobParaDataURL
};