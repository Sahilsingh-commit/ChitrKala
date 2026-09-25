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
      <div className="alert alert-danger">
        Failed to load marketplace products: {error}. Is the backend running on port 4000?
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
