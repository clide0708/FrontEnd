const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageSrc
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
  })

  console.log("[v0] Image natural dimensions:", image.naturalWidth, "x", image.naturalHeight)
  console.log("[v0] Crop area received:", pixelCrop)

  const clippedCrop = {
    x: Math.max(0, Math.min(pixelCrop.x, image.naturalWidth)),
    y: Math.max(0, Math.min(pixelCrop.y, image.naturalHeight)),
    width: Math.min(pixelCrop.width, image.naturalWidth - pixelCrop.x),
    height: Math.min(pixelCrop.height, image.naturalHeight - pixelCrop.y),
  }

  console.log("[v0] Clipped crop area:", clippedCrop)

  const MAX_SIZE = 800
  let outputWidth = clippedCrop.width
  let outputHeight = clippedCrop.height

  if (outputWidth > MAX_SIZE || outputHeight > MAX_SIZE) {
    const ratio = Math.min(MAX_SIZE / outputWidth, MAX_SIZE / outputHeight)
    outputWidth = Math.round(outputWidth * ratio)
    outputHeight = Math.round(outputHeight * ratio)
    console.log("[v0] Resizing output to:", outputWidth, "x", outputHeight)
  }

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d", { alpha: false })

  canvas.width = outputWidth
  canvas.height = outputHeight

  ctx.drawImage(
    image,
    clippedCrop.x,
    clippedCrop.y,
    clippedCrop.width,
    clippedCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  )

  console.log("[v0] Canvas created:", canvas.width, "x", canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"))
          return
        }
        console.log("[v0] Blob size:", (blob.size / 1024).toFixed(2), "KB")
        resolve(blob)
      },
      "image/jpeg",
      0.8,
    )
  })
}

export default getCroppedImg;