import { Router } from "express";
import multer from "multer";
import { generateListingFromVoiceNote } from "../services/geminiService.js";

const router = Router();

// Keep voice notes in memory - they're small (a few seconds to ~1 min of audio)
// and we don't need to persist the raw file for the MVP.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB safety cap
});

// POST /api/catalog
// multipart/form-data with a single field "voiceNote" (audio file)
router.post("/catalog", upload.single("voiceNote"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No voice note received. Send it as multipart/form-data field 'voiceNote'.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Server misconfigured: GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.",
    });
  }

  try {
    const listing = await generateListingFromVoiceNote(
      req.file.buffer,
      req.file.mimetype || "audio/webm"
    );
    return res.json({ success: true, listing });
  } catch (err) {
    console.error("Catalog generation failed:", err.message);
    return res.status(502).json({
      success: false,
      error: "AI listing generation failed. See server logs for details.",
      detail: err.message,
    });
  }
});

export default router;
