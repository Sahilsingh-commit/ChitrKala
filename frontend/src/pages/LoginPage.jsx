import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("artisan@chitrkala.ai");
  const [password, setPassword] = useState("••••••••");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Directly navigate to seller page on login submit
    navigate("/seller");
  };

  return (
    <div className="login-layout">
      {/* Hero / Brand Side */}
      <div className="login-hero">
        <h1>
          ChitrKala Artisan<br />
          AI <span className="accent">Studio</span>
        </h1>
        <p>{t("loginHeroDesc")}</p>

        <ul className="feature-list">
          <li>
            <div className="feature-icon orange">🎙️</div>
            <span>{t("featVoice")}</span>
          </li>
          <li>
            <div className="feature-icon orange">🖼️</div>
            <span>{t("featImage")}</span>
          </li>
          <li>
            <div className="feature-icon green">📊</div>
            <span>{t("featPricing")}</span>
          </li>
          <li>
            <div className="feature-icon blue">🛍️</div>
            <span>{t("featWhatsapp")}</span>
          </li>
        </ul>
      </div>

      {/* Auth / Quick Access Panel */}
      <div className="login-form-panel">
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Artisan & Buyer Portal</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 4 }}>
              Enter portal via login or fast demo bypass
            </p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="field">
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="artisan@chitrkala.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: "20px" }}
            >
              Sign In to Artisan Studio →
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">or choose role via Quick Demo</span>
          </div>

          <div className="quick-access-grid">
            <button
              type="button"
              className="quick-access-btn"
              onClick={() => navigate("/seller")}
            >
              <span className="quick-access-icon">🎨</span>
              <span className="quick-access-label">{t("navSeller")}</span>
              <span className="quick-access-desc">AI image + voice cataloger</span>
            </button>
            <button
              type="button"
              className="quick-access-btn"
              onClick={() => navigate("/buyer")}
            >
              <span className="quick-access-icon">🛍️</span>
              <span className="quick-access-label">{t("navBuyer")}</span>
              <span className="quick-access-desc">Browse artisan products</span>
            </button>
          </div>

          <p
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              textAlign: "center",
              marginTop: "14px",
            }}
          >
            {t("demoNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
