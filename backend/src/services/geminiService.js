import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// One multimodal call does speech understanding, translation, and
// SEO-friendly listing generation together - no separate STT/MT steps.
const LISTING_PROMPT = `You are a cataloging assistant for ChitrKala, an app that helps
Indian artisans sell their handmade products online.

You will receive a voice note in which an artisan describes a product they made,
in any Indian regional language, Hindi, or English (possibly mixed).

Listen carefully and produce ONE JSON object, and nothing else (no markdown fences,
no commentary), with exactly this shape:

{
  "detected_language": "string - the language you heard, e.g. 'Hindi', 'Marathi', 'Hindi-English mixed'",
  "transcript": "string - a faithful transcript/translation of what the artisan said, in English",
  "title": "string - a short, catchy, SEO-friendly product title, max 8 words",
  "description_en": "string - a 2-3 sentence professional product description in English, highlighting craftsmanship and materials",
  "description_hi": "string - the same description translated naturally into Hindi",
  "category": "string - best-guess product category, e.g. 'Handloom textile', 'Pottery', 'Jewelry', 'Woodwork'",
  "tags": ["array", "of", "5-8", "lowercase", "seo", "keywords"],
  "confidence": "number between 0 and 1 - how confident you are in this transcription and listing"
}

If the audio is unclear or silent, still return valid JSON with your best guess and
a low confidence score - never return an error string instead of JSON.`;

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest"
];

/**
 * Takes request contents and tries candidate models with retries and backoff
 * when rate limits (429) or temporary server overload (503) occur.
 */
async function callGeminiWithRetry(contents, maxRetries = 3) {
  let lastError;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await ai.models.generateContent({ model, contents });
      } catch (err) {
        lastError = err;
        const msg = err.message || "";
        const isRateLimited = err.status === 429 || err.code === 429 || msg.includes("Quota exceeded") || msg.includes("RESOURCE_EXHAUSTED");
        const isOverloaded = msg.includes("UNAVAILABLE") || msg.includes("high demand") || err.status === 503;

        // If model is deprecated/not found, break attempt loop immediately and try next candidate model
        if (err.status === 404 || msg.includes("not found") || msg.includes("no longer available")) {
          console.warn(`Model ${model} unavailable, trying fallback...`);
          break;
        }

        if (isRateLimited || isOverloaded) {
          // Extract retryDelay if available in error detail, default to backoff
          const waitMs = attempt * 2000;
          console.warn(`Model ${model} rate-limited/overloaded (attempt ${attempt}/${maxRetries}). Retrying in ${waitMs}ms...`);
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            continue;
          }
        }
        // If retries exhausted for this model, break inner loop to try next fallback model
        console.warn(`Model ${model} failed after retries. Trying next candidate model...`);
        break;
      }
    }
  }

  throw lastError;
}

export async function generateListingFromVoiceNote(audioBuffer, mimeType) {
  const contents = [
    {
      role: "user",
      parts: [
        { text: LISTING_PROMPT },
        {
          inlineData: {
            mimeType,
            data: audioBuffer.toString("base64"),
          },
        },
      ],
    },
  ];

  const result = await callGeminiWithRetry(contents);

  const rawText = result.text;

  // Gemini sometimes wraps JSON in ```json fences despite instructions - strip them.
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let listing;
  try {
    listing = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Failed to parse Gemini response as JSON. Raw response: ${rawText.slice(0, 500)}`
    );
  }

  return listing;
}