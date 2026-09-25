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
 * Processes an input product image using 100% local ONNX AI background removal
 * and Jimp studio image standardization.
 *
 * @param {Buffer} imageBuffer - Raw image buffer uploaded by user
 * @param {string} inputMimeType - Input file mime type (e.g. "image/jpeg", "image/png")
 * @param {Object} options
 * @param {string} [options.backgroundColor="#FFFFFF"] - Hex code or 'transparent'
 * @param {number} [options.targetSize=1000] - Canvas dimensions (targetSize x targetSize)
 * @param {boolean} [options.enhanceLighting=true] - Auto brightness & saturation
 * @param {string} [options.format="jpeg"] - "jpeg" or "png"
 * @returns {Promise<{ buffer: Buffer, mimeType: string, width: number, height: number }>}
 */
export async function processImageStudio(imageBuffer, inputMimeType = "image/png", options = {}) {
  const {
    backgroundColor = "#FFFFFF",
    targetSize = 1000,
    enhanceLighting = true,
    format = "jpeg",
  } = options;

  console.log("Starting local AI background removal (ONNX model)...");

  // 1. Remove background locally via ONNX WebAssembly model
  const mime = inputMimeType.includes("jpg") || inputMimeType.includes("jpeg") ? "image/jpeg" : "image/png";
  const blob = new Blob([imageBuffer], { type: mime });

  const bgRemovedBlob = await removeBackground(blob, {
    output: {
      type: "image/png",
      quality: 0.95,
    },
  });

  const bgRemovedBuffer = Buffer.from(await bgRemovedBlob.arrayBuffer());
  console.log("Background removal complete. Applying studio framing & enhancement...");

  // 2. Load foreground object in Jimp
  const fg = await Jimp.read(bgRemovedBuffer);

  // 3. Apply studio lighting & color enhancement directly to foreground product if enabled
  if (enhanceLighting && typeof fg.color === "function") {
    fg.color([
      { apply: "lighten", params: [4] },
      { apply: "saturate", params: [8] },
    ]);
  }

  // 4. Scale product down to fit inner target size maintaining aspect ratio (15% margin)
  const paddingPercent = 0.15;
  const innerSize = Math.round(targetSize * (1 - paddingPercent * 2));
  fg.scaleToFit({ w: innerSize, h: innerSize });

  // 5. Create studio canvas with chosen background color
  const bgHex = parseColorToJimpHex(backgroundColor);
  const studioCanvas = new Jimp({ width: targetSize, height: targetSize, color: bgHex });

  // Center product on studio canvas
  const offsetX = Math.round((targetSize - fg.width) / 2);
  const offsetY = Math.round((targetSize - fg.height) / 2);
  studioCanvas.composite(fg, offsetX, offsetY);

  // 6. Export output buffer
  const isTransparent = backgroundColor === "transparent" || backgroundColor === "none" || format === "png";
  const outputMime = isTransparent ? "image/png" : "image/jpeg";
  const finalBuffer = await studioCanvas.getBuffer(outputMime);

  console.log("Image studio processing complete. Output size:", finalBuffer.length, "bytes.");

  return {
    buffer: finalBuffer,
    mimeType: outputMime,
    width: targetSize,
    height: targetSize,
  };
}
