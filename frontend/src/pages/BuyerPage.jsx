import React, { useState, useEffect } from "react";
import Marketplace from "../components/Marketplace";
import { useLanguage } from "../context/LanguageContext";

const GET_PRODUCTS_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/products` : "http://localhost:4000/api/products";

export default function BuyerPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(GET_PRODUCTS_URL);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch products");
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <h2>{t("buyerPageTitle")}</h2>
          <p>{t("buyerPageSubtitle")}</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchProducts}
          disabled={isLoading}
          style={{ flexShrink: 0, marginTop: 4 }}
        >
          {t("refresh")}
        </button>
      </div>

      {!isLoading && !error && products.length > 0 && (
        <div className="stat-row" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-label">Total Listings</div>
            <div className="stat-value brand">{products.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Handmade Items</div>
            <div className="stat-value">{products.filter((p) => p.is_handmade).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg. Price</div>
            <div className="stat-value">
              ₹
              {Math.round(
                products.reduce((s, p) => s + (p.price || 0), 0) / products.length
              ).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      )}

      <Marketplace products={products} isLoading={isLoading} error={error} />
    </div>
  );
}
