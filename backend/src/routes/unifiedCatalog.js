import { Router } from "express";
import multer from "multer";
import { generateListingFromVoiceNote } from "../services/geminiService.js";
import { processImageStudio } from "../services/imageStudioService.js";
import { buildPricingBlock } from "../services/pricingService.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB cap
});

// POST /api/unified-catalog
// multipart/form-data with fields:
// - "image": product photo file
// - "voiceNote": voice audio file
// - "backgroundColor", "enhanceLighting", "targetSize" (optional studio params)
// - "artisan_expected_price", "build_time", "is_handmade" (pricing params)
router.post(
  "/unified-catalog",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "voiceNote", maxCount: 1 },
  ]),
  async (req, res) => {
    const imageFile = req.files?.image?.[0];
    const voiceFile = req.files?.voiceNote?.[0];

    if (!imageFile && !voiceFile) {
      return res.status(400).json({
        success: false,
        error: "At least one input (image or voiceNote) must be provided.",
      });
    }

    const {
      backgroundColor = "#FFFFFF",
      targetSize = 1000,
      enhanceLighting = "true",
      format = "jpeg",
      artisan_expected_price = null,
      build_time = "1–3 days",
      is_handmade = "true",
    } = req.body;

    const parsedIsHandmade = is_handmade === "true" || is_handmade === true;
    const parsedExpectedPrice = artisan_expected_price ? parseFloat(artisan_expected_price) : null;

    // Build promises array for concurrent processing via Promise.allSettled
    const imagePromise = imageFile
      ? processImageStudio(imageFile.buffer, imageFile.mimetype || "image/png", {
          backgroundColor,
          targetSize: parseInt(targetSize, 10) || 1000,
          enhanceLighting: enhanceLighting === "true" || enhanceLighting === true,
          format,
        })
      : Promise.reject(new Error("No image file uploaded."));

    const voicePromise = voiceFile
      ? generateListingFromVoiceNote(
          voiceFile.buffer,
          voiceFile.mimetype || "audio/webm"
        )
      : Promise.reject(new Error("No voice note uploaded."));

    console.log("Processing image studio and Gemini voice cataloging concurrently...");
    const [imageResult, voiceResult] = await Promise.allSettled([
      imagePromise,
      voicePromise,
    ]);

    // Construct response object
    let studioData = null;
    let listingData = null;

    // Handle Image Studio result
    if (imageResult.status === "fulfilled") {
      const resVal = imageResult.value;
      studioData = {
        processed_image: `data:${resVal.mimeType};base64,${resVal.buffer.toString("base64")}`,
        original_image: imageFile
          ? `data:${imageFile.mimetype || "image/jpeg"};base64,${imageFile.buffer.toString("base64")}`
          : null,
        mimeType: resVal.mimeType,
        width: resVal.width,
        height: resVal.height,
        sizeBytes: resVal.buffer.length,
        image_error: null,
      };
    } else {
      studioData = {
        processed_image: null,
        original_image: imageFile
          ? `data:${imageFile.mimetype || "image/jpeg"};base64,${imageFile.buffer.toString("base64")}`
          : null,
        image_error: imageFile
          ? `Image Studio processing failed: ${imageResult.reason?.message}`
          : "No image uploaded",
      };
    }

    // Handle Gemini Voice Catalog result + Pricing calculation
    if (voiceResult.status === "fulfilled") {
      const voiceVal = voiceResult.value;
      const pricingBlock = buildPricingBlock(voiceVal, {
        is_handmade: parsedIsHandmade,
        build_time,
        artisan_expected_price: parsedExpectedPrice,
      });

      listingData = {
        ...voiceVal,
        pricing: pricingBlock,
        listing_error: null,
      };
    } else {
      // Baseline pricing if voice note failed/missing but artisan provided parameters
      const fallbackPricing = buildPricingBlock(
        { category: "_default", complexity_tier: "standard" },
        {
          is_handmade: parsedIsHandmade,
          build_time,
          artisan_expected_price: parsedExpectedPrice,
        }
      );

      listingData = {
        title: null,
        description_en: null,
        description_hi: null,
        category: null,
        tags: [],
        confidence: 0,
        transcript: null,
        detected_language: null,
        pricing: fallbackPricing,
        listing_error: voiceFile
          ? `Voice cataloging failed: ${voiceResult.reason?.message}`
          : "No voice note provided",
      };
    }

    const hasAnySuccess =
      imageResult.status === "fulfilled" || voiceResult.status === "fulfilled";

    return res.status(hasAnySuccess ? 200 : 500).json({
      success: hasAnySuccess,
      listing: listingData,
      studio: studioData,
    });
  }
);

export default router;
