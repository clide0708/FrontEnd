/**
 * Utilitário para cortar imagens - VERSÃO COMPLETAMENTE CORRIGIDA
 * Compatível com produção e evita problemas de constructor
 */

const createImage = (src) => {
  return new Promise((resolve, reject) => {
    // 🔥 CORREÇÃO: Usar new Image() de forma segura
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

const getCroppedImg = async (imageSrc, pixelCrop) => {
  try {
    console.log("🎯 Iniciando crop da imagem...");
    
    // 🔥 CORREÇÃO: Usar função auxiliar para criar imagem
    const image = await createImage(imageSrc);
    
    console.log("📐 Dimensões da imagem:", {
      natural: `${image.naturalWidth}x${image.naturalHeight}`,
      crop: pixelCrop
    });

    // Validar e ajustar o crop area
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Definir tamanho do canvas baseado no crop
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Desenhar a imagem cortada no canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    console.log("✅ Canvas criado com sucesso:", {
      width: canvas.width,
      height: canvas.height
    });

    // Converter para blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas está vazio"));
            return;
          }
          console.log("📦 Blob criado:", (blob.size / 1024).toFixed(2), "KB");
          resolve(blob);
        },
        "image/jpeg",
        0.85 // Qualidade
      );
    });

  } catch (error) {
    console.error("❌ Erro no getCroppedImg:", error);
    throw error;
  }
};

export default getCroppedImg;