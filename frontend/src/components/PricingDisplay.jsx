import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function PricingDisplay({ listingData, studioData, onPostToMarketplace, isPosting }) {
  const { t } = useLanguage();
  const listing = listingData || {};
  const studio = studioData || {};
  const pricing = listing.pricing || {};

  const [selectedPrice, setSelectedPrice] = useState(0);
  const [activePreset, setActivePreset] = useState("recommended");
  const [isPriceConfirmed, setIsPriceConfirmed] = useState(false);

  useEffect(() => {
    if (pricing.suggested) {
      setSelectedPrice(pricing.suggested);
      setActivePreset("recommended");
      setIsPriceConfirmed(false);
    }
  }, [pricing.suggested]);

  const handleSelectPreset = (amount, name) => {
    setSelectedPrice(amount);
    setActivePreset(name);
    setIsPriceConfirmed(false);
  };

  const handleConfirmPrice = () => {
    if (!selectedPrice || selectedPrice <= 0) return;
    setIsPriceConfirmed(true);
  };

  const handlePost = () => {
    onPostToMarketplace({
      title: listing.title || "Handmade Artisan Craft",
      description_en: listing.description_en || "",
      description_hi: listing.description_hi || "",
      category: listing.category || "Handmade Craft",
      price: selectedPrice,
      is_handmade: pricing.is_handmade ?? true,
      tags: listing.tags || [],
      image: studio.processed_image || studio.original_image || null,
      phone: "919876543210",
    });
  };

  const fmt = (n) => (n ? n.toLocaleString("en-IN") : "0");

  return (
    <div>
      {/* ── Warnings ── */}
      {listing.listing_error && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          Voice cataloging was partial: {listing.listing_error}
        </div>
      )}
      {studio.image_error && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          Image studio: {studio.image_error}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* ── Studio Image ── */}
        <div>
          <div className="card" style={{ marginBottom: 14, padding: 16 }}>
            <p className="section-label">{t("studioOutput")}</p>
            {studio.processed_image ? (
              <div className="studio-output">
                <img src={studio.processed_image} alt="Studio product" />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <div className="empty-state-icon">🖼️</div>
                <p>No studio image generated</p>
              </div>
            )}
            {studio.processed_image && (
              <a
                href={studio.processed_image}
                download="chitrkala-studio.jpg"
                className="btn btn-secondary btn-block"
                style={{ marginTop: 12 }}
              >
                {t("downloadPhoto")}
              </a>
            )}
          </div>
        </div>

        {/* ── AI Listing Details ── */}
        <div className="card" style={{ marginBottom: 0 }}>
          {/* Header row */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 }}>
            {pricing.is_handmade && (
              <span className="badge badge-handmade">✓ {t("handmade")}</span>
            )}
            {pricing.tier_used && (
              <span className="badge badge-tier">{pricing.tier_used.toUpperCase()} tier</span>
            )}
            {listing.confidence > 0 && (
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                {Math.round(listing.confidence * 100)}% {t("aiConfidence")}
              </span>
            )}
          </div>

          {listing.title && (
            <h2 style={{ marginBottom: 14, fontSize: "1.2rem" }}>{listing.title}</h2>
          )}

          {listing.description_en && (
            <div className="field">
              <label className="field-label">{t("descriptionEn")}</label>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                {listing.description_en}
              </p>
            </div>
          )}

          {listing.description_hi && (
            <div className="field">
              <label className="field-label">{t("descriptionHi")}</label>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                {listing.description_hi}
              </p>
            </div>
          )}

          {listing.category && (
            <div className="field">
              <label className="field-label">{t("category")}</label>
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>{listing.category}</p>
            </div>
          )}

          {listing.tags && listing.tags.length > 0 && (
            <div className="field">
              <label className="field-label">{t("seoKeywords")}</label>
              <div className="tags-container">
                {listing.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Price Benchmark Section ── */}
      {pricing.range_low && (
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">{t("smartPricing")}</div>
              <div className="card-subtitle">
                Based on category data & craftsmanship tier — select your listing price below
              </div>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              ₹{fmt(pricing.range_low)} – ₹{fmt(pricing.range_high)} {t("marketRange")}
            </span>
          </div>

          <div className="price-preset-grid">
            <div
              className={`price-preset${activePreset === "low" ? " selected" : ""}`}
              onClick={() => handleSelectPreset(pricing.range_low, "low")}
            >
              <span className="preset-tier">{t("floor")}</span>
              <div className="preset-price">₹{fmt(pricing.range_low)}</div>
            </div>
            <div
              className={`price-preset${activePreset === "recommended" ? " selected" : ""}`}
              onClick={() => handleSelectPreset(pricing.suggested, "recommended")}
            >
              <span className="preset-tier">{t("recommended")}</span>
              <div className="preset-price">₹{fmt(pricing.suggested)}</div>
            </div>
            <div
              className={`price-preset${activePreset === "high" ? " selected" : ""}`}
              onClick={() => handleSelectPreset(pricing.range_high, "high")}
            >
              <span className="preset-tier">{t("premium")}</span>
              <div className="preset-price">₹{fmt(pricing.range_high)}</div>
            </div>
          </div>

          {/* Artisan estimate chip */}
          {pricing.artisan_expected_price && (
            <div style={{ margin: "8px 0" }}>
              <span className="artisan-estimate-chip">
                Your estimate: ₹{fmt(pricing.artisan_expected_price)}
                {pricing.outside_market_range && " · outside market range"}
              </span>
            </div>
          )}

          {pricing.outside_market_range && (
            <div className="alert alert-warning" style={{ marginTop: 10 }}>
              Your estimated price is outside the typical market range for this category. Review our
              suggested benchmarks above before listing.
            </div>
          )}

          {/* Tier Factors & Reasoning */}
          {pricing.reasoning && pricing.reasoning.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="section-label">{t("reasoning")}</p>
              <ul className="reasoning-list">
                {pricing.reasoning.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <hr className="hr" />

          {/* Final price input */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">{t("finalPrice")}</label>
              <input
                type="number"
                value={selectedPrice}
                onChange={(e) => {
                  setSelectedPrice(parseFloat(e.target.value) || 0);
                  setActivePreset("custom");
                  setIsPriceConfirmed(false);
                }}
                style={{ fontWeight: 700, fontSize: "1.1rem" }}
              />
            </div>
            <button
              type="button"
              className={`btn ${isPriceConfirmed ? "btn-ghost" : "btn-secondary"}`}
              onClick={handleConfirmPrice}
              style={{ marginBottom: 0, flexShrink: 0 }}
            >
              {isPriceConfirmed ? t("priceLocked") : t("confirmPrice")}
            </button>
          </div>

          <button
            type="button"
            className="btn btn-success btn-block btn-lg"
            style={{ marginTop: 16 }}
            disabled={!isPriceConfirmed || isPosting}
            onClick={handlePost}
          >
            {isPosting ? (
              <>
                <div className="spinner" />
                {t("publishingBtn")}
              </>
            ) : isPriceConfirmed ? (
              t("publishBtn")
            ) : (
              t("lockPriceToPublish")
            )}
          </button>
        </div>
      )}
    </div>
  );
}
