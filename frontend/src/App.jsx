import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import LoginPage from "./pages/LoginPage";
import SellerPage from "./pages/SellerPage";
import BuyerPage from "./pages/BuyerPage";

function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const isEntryPage = location.pathname === "/";

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        ChitrKala<span className="brand-dot">.</span><span className="brand-accent">AI</span>
      </NavLink>

      <div className="navbar-right">
        {/* Only show navigation links when user has entered Studio/Marketplace */}
        {!isEntryPage && (
          <nav className="nav-links">
            <NavLink
              to="/seller"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {t("navSeller")}
            </NavLink>
            <NavLink
              to="/buyer"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {t("navBuyer")}
            </NavLink>
          </nav>
        )}

        {/* Language Switcher Pill */}
        <div className="lang-switcher">
          <button
            type="button"
            className={`lang-btn${lang === "en" ? " active" : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            className={`lang-btn${lang === "hi" ? " active" : ""}`}
            onClick={() => setLang("hi")}
          >
            हिंदी
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/seller" element={<SellerPage />} />
              <Route path="/buyer" element={<BuyerPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
