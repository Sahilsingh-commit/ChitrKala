/**
 * Centralized API configuration for ChitrKala Frontend
 * Handles automatic fallback, path normalization, slash trimming, and HTTPS enforcement.
 */

const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;

  // 1. If VITE_API_URL is specified in build environment variables
  if (envUrl && envUrl.trim() !== "") {
    let cleanUrl = envUrl.trim().replace(/\/+$/, ""); // Remove trailing slashes
    // Automatically append /api if missing
    if (!cleanUrl.endsWith("/api")) {
      cleanUrl = `${cleanUrl}/api`;
    }
    // Enforce HTTPS for production remote URLs to prevent Mixed Content browser blocking
    if (!cleanUrl.startsWith("http://localhost") && !cleanUrl.startsWith("http://127.0.0.1")) {
      cleanUrl = cleanUrl.replace(/^http:\/\//i, "https://");
    }
    return cleanUrl;
  }

  // 2. If running in local development mode
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:4000/api";
  }

  // 3. Fallback for deployed production (e.g. Vercel) if VITE_API_URL was not set during build
  return "https://chitrkala-backend.onrender.com/api";
};

export const API_BASE_URL = getApiBaseUrl();
export const GET_PRODUCTS_URL = `${API_BASE_URL}/products`;
export const UNIFIED_URL = `${API_BASE_URL}/unified-catalog`;
export const POST_PRODUCT_URL = `${API_BASE_URL}/products`;
