import React, { useState } from "react";
import { Link } from "react-router-dom";
import ListingForm from "../components/ListingForm";
import PricingDisplay from "../components/PricingDisplay";
import { useLanguage } from "../context/LanguageContext";
import { UNIFIED_URL, POST_PRODUCT_URL } from "../config/api";

export default function SellerPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postedProduct, setPostedProduct] = useState(null);

  const handleGenerateListing = async (opts) => {
    setIsLoading(true);
    setError(null);
    setPostedProduct(null);

    const fd = new FormData();
    if (opts.imageFile && opts.imageFile instanceof Blob) {
      fd.append("image", opts.imageFile);
    }
    if (opts.audioBlob && opts.audioBlob instanceof Blob) {
      fd.append("voiceNote", opts.audioBlob, "note.webm");
    }
    fd.append("backgroundColor", opts.bgColor || "#FFFFFF");
    fd.append("enhanceLighting", String(opts.enhanceLighting ?? "true"));
    if (opts.expectedPrice) fd.append("artisan_expected_price", String(opts.expectedPrice));
    fd.append("build_time", opts.buildTime || "1–3 days");
    fd.append("is_handmade", opts.isHandmade ? "true" : "false");

    try {
      console.log("Submitting to UNIFIED_URL:", UNIFIED_URL);
      const res = await fetch(UNIFIED_URL, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok && !data?.studio?.processed_image && !data?.listing?.title) {
        throw new Error(data.error || `Server error ${res.status}: Failed to process cataloging.`);
      }
      setResult(data);
    } catch (err) {
      console.error("Generate listing error:", err);
      const msg = err?.message || String(err);
      if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed")) {
        setError(`Network Error: Unable to reach backend at ${UNIFIED_URL}. If on Render, the backend server may be waking up from a cold start or blocked by browser settings.`);
      } else {
        setError(`Request Error: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostToMarketplace = async (payload) => {
    setIsPosting(true);
    setError(null);
    try {
      const res = await fetch(POST_PRODUCT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to post product.");
      setPostedProduct(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{t("sellerPageTitle")}</h2>
        <p>{t("sellerPageSubtitle")}</p>
      </div>

      {/* Stats row
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">AI Models</div>
          <div className="stat-value brand">Local + Gemini</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Image Processing</div>
          <div className="stat-value">ONNX · On-device</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Languages Supported</div>
          <div className="stat-value">All Indian</div>
        </div>
      </div> */}

      {/* Success banner */}
      {postedProduct && (
        <div className="success-banner">
          <div className="success-banner-content">
            <h4>{t("publishedSuccess")}</h4>
            <p>
              &ldquo;{postedProduct.title}&rdquo; is now live at ₹
              {postedProduct.price?.toLocaleString("en-IN")}
            </p>
          </div>
          <Link to="/buyer" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
            {t("viewMarketplace")}
          </Link>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <ListingForm onGenerateListing={handleGenerateListing} isLoading={isLoading} />

      {result && (
        <PricingDisplay
          listingData={result.listing}
          studioData={result.studio}
          onPostToMarketplace={handlePostToMarketplace}
          isPosting={isPosting}
        />
      )}
    </div>
  );
}
