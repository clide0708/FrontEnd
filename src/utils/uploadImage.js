/**
 * Upload de imagem para o servidor
 */
export const uploadImagemParaServidor = async (blob, nomeArquivo = null) => {
  try {
    // Gerar nome único para o arquivo
    const nomeFinal = nomeArquivo || `perfil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    // Criar FormData para upload
    const formData = new FormData();
    formData.append('foto', blob, nomeFinal);

    console.log('📤 Iniciando upload da imagem...');

    // Fazer upload para o servidor - REMOVA o /api/ da URL
    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/foto-perfil`, {
      method: 'POST',
      body: formData,
    });

    // Verificar se a resposta é válida
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    // Verificar se é JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta não é JSON:', text.substring(0, 200));
      throw new Error('Resposta do servidor não é JSON válido');
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Upload realizado com sucesso:', result.nome_arquivo);
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
    console.error('❌ Erro no upload:', error);
    
    // Fallback: usar blob URL localmente
    const urlBlob = URL.createObjectURL(blob);
    console.warn('⚠️ Usando fallback com blob URL local');
    
    return {
      success: true, // Marcamos como sucesso para continuar o processo
      url: urlBlob,
      nome_arquivo: nomeArquivo || `perfil_local_${Date.now()}.jpg`,
      message: 'Imagem salva localmente (fallback)',
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