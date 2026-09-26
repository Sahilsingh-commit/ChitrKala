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

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:5173",           // local dev
  "https://chitrkala-metric.vercel.app" // your actual deployed Vercel URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // only needed if you're sending cookies/auth headers cross-site
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

app.listen(PORT, () => {
  console.log(`ChitrKala backend running on http://localhost:${PORT}`);
});