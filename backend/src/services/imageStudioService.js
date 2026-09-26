import removeBackground from "@imgly/background-removal-node";
import { Jimp } from "jimp";

/**
 * Converts a hex color string (e.g. "#FFFFFF", "#FAFAF7") or "transparent" to a 32-bit RGBA number for Jimp.
 * @param {string} colorStr
 * @returns {number} 32-bit integer color
 */
function parseColorToJimpHex(colorStr) {
  if (!colorStr || colorStr === "transparent" || colorStr === "none") {
    return 0x00000000;
  }
  let hex = colorStr.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length === 6) {
    hex = hex + "FF";
  }
  return parseInt(hex, 16);
}

/**
 * Helper to produce a small compressed base64 JPEG from an image buffer for previews.
 */
export async function createSmallPreviewBase64(imageBuffer, maxDim = 600) {
  try {
    const img = await Jimp.read(imageBuffer);
    if (img.width > maxDim || img.height > maxDim) {
      img.scaleToFit({ w: maxDim, h: maxDim });
    }
    const buf = await img.getBuffer("image/jpeg");
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch (err) {
    console.warn("Failed to create preview image, falling back to raw buffer:", err.message);
    return `data:image/jpeg;base64,${imageBuffer.slice(0, 100 * 1024).toString("base64")}`;
  }
}

/**
 * Processes an input product image using optimized AI background removal
 * and lightweight Jimp studio framing.
 *
 * @param {Buffer} imageBuffer - Raw image buffer uploaded by user
 * @param {string} inputMimeType - Input file mime type (e.g. "image/jpeg", "image/png")
 * @param {Object} options
 * @param {string} [options.backgroundColor="#FFFFFF"] - Hex code or 'transparent'
 * @param {number} [options.targetSize=800] - Canvas dimensions (targetSize x targetSize)
 * @param {boolean} [options.enhanceLighting=true] - Auto brightness & saturation
 * @param {string} [options.format="jpeg"] - "jpeg" or "png"
 * @returns {Promise<{ buffer: Buffer, mimeType: string, width: number, height: number }>}
 */
export async function processImageStudio(imageBuffer, inputMimeType = "image/png", options = {}) {
  const {
    backgroundColor = "#FFFFFF",
    targetSize = 800,
    enhanceLighting = true,
    format = "jpeg",
  } = options;

  console.log("Processing product image for Studio...");

  let fg;
  let baseImg;

  try {
    baseImg = await Jimp.read(imageBuffer);
    // Pre-downscale large camera photos to max 800px to avoid high memory/CPU usage
    if (baseImg.width > 800 || baseImg.height > 800) {
      baseImg.scaleToFit({ w: 800, h: 800 });
    }
    const preprocessedBuf = await baseImg.getBuffer("image/png");

    // Attempt AI background removal with safe fallback
    try {
      console.log("Attempting local AI background removal...");
      const blob = new Blob([preprocessedBuf], { type: "image/png" });
      const bgRemovedBlob = await removeBackground(blob, {
        output: { type: "image/png", quality: 0.9 },
      });
      const bgRemovedBuffer = Buffer.from(await bgRemovedBlob.arrayBuffer());
      fg = await Jimp.read(bgRemovedBuffer);
      console.log("Background removal complete.");
    } catch (bgErr) {
      console.warn("Background removal skipped/failed (using fallback studio framing):", bgErr.message);
      fg = baseImg;
    }
  } catch (err) {
    console.error("Failed to load input image buffer:", err.message);
    throw err;
  }

  // Apply lighting enhancement if requested
  if (enhanceLighting && typeof fg.color === "function") {
    try {
      fg.color([
        { apply: "lighten", params: [4] },
        { apply: "saturate", params: [8] },
      ]);
    } catch (e) {
      // Ignore color operation error on fallback images
    }
  }

  // Scale product to fit inside target studio canvas with 15% padding
  const paddingPercent = 0.15;
  const innerSize = Math.round(targetSize * (1 - paddingPercent * 2));
  fg.scaleToFit({ w: innerSize, h: innerSize });

  // Create studio canvas with chosen background color
  const bgHex = parseColorToJimpHex(backgroundColor);
  const studioCanvas = new Jimp({ width: targetSize, height: targetSize, color: bgHex });

  // Center product on studio canvas
  const offsetX = Math.round((targetSize - fg.width) / 2);
  const offsetY = Math.round((targetSize - fg.height) / 2);
  studioCanvas.composite(fg, offsetX, offsetY);

  // Export compressed output buffer
  const isTransparent = backgroundColor === "transparent" || backgroundColor === "none" || format === "png";
  const outputMime = isTransparent ? "image/png" : "image/jpeg";
  const finalBuffer = await studioCanvas.getBuffer(outputMime);

  console.log("Image studio processing complete. Compressed output size:", finalBuffer.length, "bytes.");

  return {
    buffer: finalBuffer,
    mimeType: outputMime,
    width: targetSize,
    height: targetSize,
  };
}
