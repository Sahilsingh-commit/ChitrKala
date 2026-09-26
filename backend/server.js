import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, getIsDbConnected } from "./src/config/db.js";
import catalogRoutes from "./src/routes/catalog.js";
import imageStudioRoutes from "./src/routes/imageStudio.js";
import unifiedCatalogRoutes from "./src/routes/unifiedCatalog.js";
import productRoutes from "./src/routes/products.js";
import authRoutes from "./src/routes/auth.js";

console.log("Key loaded:", process.env.GEMINI_API_KEY ? "yes, length " + process.env.GEMINI_API_KEY.length : "NO - still undefined");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow local dev, any vercel.app preview/production deployment, or standard origins
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.endsWith(".vercel.app") ||
      origin === "https://chitrkala-metric.vercel.app"
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "chitrkala-backend",
    database: getIsDbConnected() ? "mongodb" : "memory_fallback",
  });
});

app.use("/api", catalogRoutes);
app.use("/api", imageStudioRoutes);
app.use("/api", unifiedCatalogRoutes);
app.use("/api", productRoutes);
app.use("/api/auth", authRoutes);

// KEY FIX: previously `connectDB()` was called without awaiting it, and
// `app.listen()` ran immediately after — so the server could start accepting
// requests (and Mongoose could start "buffering" queries) before the Atlas
// connection had actually finished. On a cold Render start, a request could
// arrive mid-handshake and time out around the 8s serverSelectionTimeoutMS
// mark, which is exactly the ~10s failure being seen.
//
// Now, the server does not start listening until the DB connection attempt
// has fully resolved — either connected successfully, or fallen back to
// memory mode. Either way, by the time any request can arrive, the app
// already knows its real DB state and won't hang mid-query.
connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`ChitrKala backend running on port ${PORT}`);
  });
});