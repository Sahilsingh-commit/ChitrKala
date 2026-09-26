import React from "react";
import ProductCard from "./ProductCard";
import { useLanguage } from "../context/LanguageContext";

export default function Marketplace({ products = [], isLoading, error }) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" style={{ animation: "spin 1s linear infinite" }}>⟳</div>
        <h3>{t("loadingProducts")}</h3>
        <p>{t("fetchingListings")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ lineHeight: 1.6 }}>
        <strong>Unable to fetch marketplace products ({error}).</strong>
        <br />
        <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
          If accessing the deployed app on Render/Vercel, the backend server may be waking up from a cold start. Please wait 15–30 seconds and try refreshing.
        </span>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🪴</div>
        <h3>{t("noProductsTitle")}</h3>
        <p>{t("noProductsDesc")}</p>
      </div>
    );
  }

  return (
    <div className="marketplace-grid">
      {products.map((product) => (
        <ProductCard key={product._id || product.id || product.createdAt} product={product} />
      ))}
    </div>
  );
}
