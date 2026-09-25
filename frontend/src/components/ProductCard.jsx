import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function ProductCard({ product }) {
  const { t } = useLanguage();
  const {
    title = "Handcrafted Product",
    description_en = "",
    description_hi = "",
    description = "",
    price = 0,
    category = "",
    image,
    is_handmade = true,
    contact_phone,
    phone = "919876543210",
  } = product || {};

  const activePhone = contact_phone || phone || "919876543210";
  const whatsappMessage = encodeURIComponent(
    `Hello! I'm interested in purchasing your product: "${title}" listed on ChitrKala.AI.`
  );
  const whatsappUrl = `https://wa.me/${activePhone}?text=${whatsappMessage}`;

  const fallback =
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={image || fallback}
          alt={title}
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallback;
          }}
        />
        {is_handmade && (
          <div className="product-badge-overlay">
            <span className="badge badge-handmade">✓ {t("handmade")}</span>
          </div>
        )}
      </div>

      <div className="product-info">
        {category && <div className="product-category">{category}</div>}
        <h3 className="product-title">{title}</h3>
        <p className="product-desc">{description_en || description_hi || description || "Artisan handcrafted product."}</p>

        <div className="product-price">
          ₹{price ? price.toLocaleString("en-IN") : "—"}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <span style={{ fontSize: "1rem" }}>💬</span>
          {t("contactSeller")}
        </a>
      </div>
    </div>
  );
}
