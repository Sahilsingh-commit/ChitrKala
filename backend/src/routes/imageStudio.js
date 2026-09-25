import { Router } from "express";
import multer from "multer";
import { processImageStudio } from "../services/imageStudioService.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB cap for high-res product photos
});

// POST /api/image-studio
// multipart/form-data with file field "image"
router.post("/image-studio", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No product image received. Send image as multipart/form-data field 'image'.",
    });
  }

  const {
    backgroundColor = "#FFFFFF",
    targetSize = 1000,
    enhanceLighting = "true",
    sharpen = "true",
    format = "jpeg",
  } = req.body;

  try {
    const result = await processImageStudio(
      req.file.buffer,
      req.file.mimetype || "image/png",
      {
        backgroundColor,
        targetSize: parseInt(targetSize, 10) || 1000,
        enhanceLighting: enhanceLighting === "true" || enhanceLighting === true,
        sharpen: sharpen === "true" || sharpen === true,
        format,
      }
    );

    const base64Image = `data:${result.mimeType};base64,${result.buffer.toString("base64")}`;

    return res.json({
      success: true,
      image: base64Image,
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      sizeBytes: result.buffer.length,
    });
  } catch (err) {
    console.error("Image studio processing failed:", err);
    return res.status(500).json({
      success: false,
      error: "Local Image Studio processing failed.",
      detail: err.message,
    });
  }
});

export default router;
