import "dotenv/config";
import express from "express";
import cors from "cors";
import catalogRoutes from "./src/routes/catalog.js";
import imageStudioRoutes from "./src/routes/imageStudio.js";
import unifiedCatalogRoutes from "./src/routes/unifiedCatalog.js";

console.log("Key loaded:", process.env.GEMINI_API_KEY ? "yes, length " + process.env.GEMINI_API_KEY.length : "NO - still undefined");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "chitrkala-backend" });
});

app.use("/api", catalogRoutes);
app.use("/api", imageStudioRoutes);
app.use("/api", unifiedCatalogRoutes);

app.listen(PORT, () => {
  console.log(`ChitrKala backend running on http://localhost:${PORT}`);
});