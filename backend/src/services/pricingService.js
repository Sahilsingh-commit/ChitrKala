import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const referencePath = path.join(__dirname, "../data/pricing-reference.json");

let pricingData = {};
try {
  const raw = fs.readFileSync(referencePath, "utf8");
  pricingData = JSON.parse(raw);
} catch (err) {
  console.warn("Could not load pricing-reference.json, using inline fallback:", err.message);
  pricingData = {
    "_default": {
      "basic": [500, 2000],
      "standard": [2000, 6000],
      "premium": [6000, 15000]
    }
  };
}

const TIER_ORDER = ["basic", "standard", "premium"];

/**
 * Step 1: Adjust tier based on craftsmanship factors (is_handmade, build_time).
 * @param {string} geminiTier - "basic" | "standard" | "premium"
 * @param {boolean} isHandmade
 * @param {string} buildTime - "Under 1 day" | "1–3 days" | "4–7 days" | "Over 1 week"
 * @returns {{ final_tier: string, tier_factors: string[] }}
 */
export function computeFinalTier(geminiTier, isHandmade = true, buildTime = "1–3 days") {
  const validTier = TIER_ORDER.includes(geminiTier?.toLowerCase())
    ? geminiTier.toLowerCase()
    : "standard";

  let idx = TIER_ORDER.indexOf(validTier);
  const tierFactors = [];

  if (geminiTier) {
    tierFactors.push(`AI complexity tier: ${validTier}`);
  }

  if (isHandmade) {
    tierFactors.push("Fully handmade artisan craftsmanship");
  } else {
    idx = Math.max(0, idx - 1);
    tierFactors.push("Not fully handmade (demoted 1 tier step)");
  }

  const normalizedBuildTime = (buildTime || "").replace("-", "–");
  if (
    normalizedBuildTime.includes("4–7") ||
    normalizedBuildTime.includes("4-7") ||
    normalizedBuildTime.toLowerCase().includes("week")
  ) {
    idx = Math.min(TIER_ORDER.length - 1, idx + 1);
    tierFactors.push(`Extended labor time (${buildTime}) (promoted 1 tier step)`);
  } else if (buildTime) {
    tierFactors.push(`Standard production duration (${buildTime})`);
  }

  return {
    final_tier: TIER_ORDER[idx],
    tier_factors: tierFactors,
  };
}

/**
 * Normalizes free-text category strings to match reference data keys.
 * @param {string} categoryStr
 * @returns {string} matched key or "_default"
 */
function normalizeCategoryKey(categoryStr = "") {
  if (!categoryStr) return "_default";

  const cleaned = categoryStr.toLowerCase().replace(/[^a-z0-9]/g, "_");

  // Exact or substring matches
  for (const key of Object.keys(pricingData)) {
    if (key === "_default") continue;
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return key;
    }
  }

  // Keyword fuzzy matches
  if (cleaned.includes("saree") || cleaned.includes("silk") || cleaned.includes("banarasi")) {
    return "banarasi_saree";
  }
  if (cleaned.includes("madhubani") || cleaned.includes("paint")) {
    return "madhubani_painting";
  }
  if (cleaned.includes("pot") || cleaned.includes("clay") || cleaned.includes("terracotta")) {
    return "pottery";
  }
  if (cleaned.includes("wood") || cleaned.includes("carv")) {
    return "woodwork";
  }
  if (cleaned.includes("cloth") || cleaned.includes("fabric") || cleaned.includes("handloom") || cleaned.includes("textile")) {
    return "handloom_textile";
  }
  if (cleaned.includes("jewel") || cleaned.includes("ornament")) {
    return "jewelry";
  }

  return "_default";
}

/**
 * Step 2: Compute suggested price range based on category & final tier.
 * @param {string} category
 * @param {string} finalTier
 * @param {number|null} artisanExpectedPrice
 * @returns {{ range_low: number, range_high: number, suggested: number, artisan_expected_price: number|null, outside_market_range: boolean, category_key: string }}
 */
export function getPriceRange(category, finalTier, artisanExpectedPrice = null) {
  const key = normalizeCategoryKey(category);
  const catTable = pricingData[key] || pricingData["_default"];
  const range = catTable[finalTier] || catTable["standard"] || [1000, 5000];

  const rangeLow = range[0];
  const rangeHigh = range[1];

  let suggested = 0;
  if (finalTier === "premium") {
    suggested = rangeLow + Math.round((rangeHigh - rangeLow) * 0.7);
  } else if (finalTier === "basic") {
    suggested = rangeLow + Math.round((rangeHigh - rangeLow) * 0.35);
  } else {
    suggested = rangeLow + Math.round((rangeHigh - rangeLow) * 0.5);
  }

  const parsedExpected = typeof artisanExpectedPrice === "number" && !isNaN(artisanExpectedPrice) && artisanExpectedPrice > 0
    ? artisanExpectedPrice
    : null;

  const outsideMarketRange = parsedExpected !== null && (parsedExpected < rangeLow || parsedExpected > rangeHigh);

  return {
    range_low: rangeLow,
    range_high: rangeHigh,
    suggested,
    artisan_expected_price: parsedExpected,
    outside_market_range: outsideMarketRange,
    category_key: key,
  };
}

/**
 * Step 3: Build complete pricing object with reasoning bullets.
 * @param {Object} listing - Gemini listing result object
 * @param {Object} options - { is_handmade, build_time, artisan_expected_price }
 * @returns {Object} Full pricing block matching Part F schema
 */
export function buildPricingBlock(listing = {}, options = {}) {
  const isHandmade = options.is_handmade === undefined ? true : Boolean(options.is_handmade);
  const buildTime = options.build_time || "1–3 days";
  const expectedPrice = options.artisan_expected_price ? parseFloat(options.artisan_expected_price) : null;

  const { final_tier, tier_factors } = computeFinalTier(listing.complexity_tier, isHandmade, buildTime);
  const priceRange = getPriceRange(listing.category, final_tier, expectedPrice);

  const reasoning = [
    `Category matched to '${priceRange.category_key.replace(/_/g, " ")}' reference data`,
    `Final complexity tier evaluated as '${final_tier.toUpperCase()}' based on craftsmanship factors`,
    final_tier === "premium"
      ? `Suggested price (₹${priceRange.suggested.toLocaleString("en-IN")}) is skewed toward upper tier for premium craftsmanship`
      : `Suggested price (₹${priceRange.suggested.toLocaleString("en-IN")}) sits balanced within market benchmark range (₹${priceRange.range_low.toLocaleString("en-IN")} – ₹${priceRange.range_high.toLocaleString("en-IN")})`,
  ];

  if (expectedPrice !== null) {
    if (priceRange.outside_market_range) {
      if (expectedPrice < priceRange.range_low) {
        reasoning.push(`Your expected price (₹${expectedPrice.toLocaleString("en-IN")}) is below market range floor (₹${priceRange.range_low.toLocaleString("en-IN")}). Consider pricing higher to reflect your labor.`);
      } else {
        reasoning.push(`Your expected price (₹${expectedPrice.toLocaleString("en-IN")}) exceeds typical market range (₹${priceRange.range_high.toLocaleString("en-IN")}). Ensure premium branding & storytelling.`);
      }
    } else {
      reasoning.push(`Your expected price (₹${expectedPrice.toLocaleString("en-IN")}) aligns nicely within current market benchmarks.`);
    }
  }

  return {
    range_low: priceRange.range_low,
    range_high: priceRange.range_high,
    suggested: priceRange.suggested,
    artisan_expected_price: priceRange.artisan_expected_price,
    outside_market_range: priceRange.outside_market_range,
    tier_used: final_tier,
    tier_factors,
    reasoning,
    is_handmade: isHandmade,
  };
}
