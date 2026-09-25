# ChitrKala — Artisan AI Studio & Multilingual Auto-Cataloger 🎨🎙️

**ChitrKala** is an AI-powered local workspace built for Indian artisans. It transforms raw product photos and regional voice descriptions into professional, e-commerce-ready studio listings (with studio canvas framing, local AI background removal, and bilingual English + Hindi SEO product listings).

---

## 🌟 Key Features

1. **Multilingual Auto-Cataloger (Voice → Listing)**
   - Artisans record product descriptions in any Indian regional language (Hindi, Marathi, Gujarati, English, etc.).
   - Uses Google Gemini Multimodal AI with automatic model retries (`gemini-3.5-flash`, `gemini-3.6-flash`, etc.) to return structured JSON with English & Hindi titles, descriptions, categories, and SEO tags in a single step.

2. **100% Local Image Studio (Local AI BG Removal + Canvas Enhancement)**
   - **Zero External API Dependency**: Uses `@imgly/background-removal-node` (ONNX WebAssembly neural network model running locally inside Node.js).
   - **E-Commerce Canvas Framing**: Automatically centers and pads products on a square 1000x1000 studio canvas (Pure White `#FFFFFF`, Off-White Cream `#FAFAF7`, or Transparent PNG).
   - **Studio Lighting Boost**: Enhances product lighting and color saturation without altering background purity.

3. **Unified Parallel Catalog Workflow (`POST /api/unified-catalog`)**
   - Processes both product photo and voice note in parallel using `Promise.allSettled()`.
   - **Partial Failure Resiliency**: If one input is missing or fails, the API gracefully returns the successful output alongside inline warnings.

---

## 📁 Repository Structure

```text
chitrkala/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── catalog.js         # Standalone POST /api/catalog (Voice)
│   │   │   ├── imageStudio.js     # Standalone POST /api/image-studio (Image)
│   │   │   └── unifiedCatalog.js  # Unified POST /api/unified-catalog (Image + Voice)
│   │   └── services/
│   │       ├── geminiService.js   # Multimodal Gemini AI service with retries
│   │       └── imageStudioService.js # Local ONNX BG removal & Jimp studio engine
│   ├── server.js                  # Express backend entry point (Port 4000)
│   ├── package.json
│   ├── .env.example               # Environment template (NO SECRETS)
│   └── .gitignore                 # Backend git ignore rules
├── web-demo/
│   └── index.html                 # Unified Artisan Web Demo UI
├── .gitignore                     # Root git ignore rules
└── README.md                      # Project documentation
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18 or higher installed on your system.
- **Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Open `backend/.env` in your code editor and add your API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=4000
```

Start the backend server:
```bash
npm start
```
*Confirm server health at `http://localhost:4000/health`.*

### 3. Launch Web Demo

Open `web-demo/index.html` directly in any web browser (Google Chrome recommended for microphone access).

---

## 📡 API Reference

### 1. Unified Catalog Endpoint

`POST /api/unified-catalog`  
**Content-Type**: `multipart/form-data`

#### Parameters:
- `image` *(file, optional)*: Product photo.
- `voiceNote` *(file, optional)*: Product voice note audio (webm/wav/mp3).
- `backgroundColor` *(string, optional)*: `#FFFFFF` (default), `#FAFAF7`, or `transparent`.
- `enhanceLighting` *(string, optional)*: `"true"` (default) or `"false"`.

#### Response Example:
```json
{
  "success": true,
  "listing": {
    "title": "Handwoven Red and Gold Banarasi Silk Saree",
    "description_en": "Exquisitely handwoven by skilled artisans...",
    "description_hi": "कुशल कारीगरों द्वारा हाथ से बुनी गई यह शुद्ध बनारसी सिल्क साड़ी...",
    "category": "Handloom textile",
    "tags": ["banarasi saree", "silk saree", "handwoven", "bridal wear"],
    "confidence": 0.95,
    "transcript": "Hello, I have handwoven this Banarasi silk saree...",
    "detected_language": "Hindi-English mixed",
    "listing_error": null
  },
  "studio": {
    "processed_image": "data:image/jpeg;base64,...",
    "original_image": "data:image/jpeg;base64,...",
    "mimeType": "image/jpeg",
    "width": 1000,
    "height": 1000,
    "image_error": null
  }
}
```

### 2. Standalone Endpoints
- `POST /api/catalog` — Accepts `voiceNote` file -> Returns bilingual listing JSON.
- `POST /api/image-studio` — Accepts `image` file -> Returns studio processed base64 image.

---

## 🔒 Security & Git Best Practices

> [!IMPORTANT]
> **Never commit `.env` or secret API keys to GitHub!**
> Both root `.gitignore` and `backend/.gitignore` are pre-configured to exclude:
> - `node_modules/`
> - `.env` and `.env.local`
> - Log files (`*.log`)
> - OS / IDE caches (`.DS_Store`, `.vscode/`)

When deploying or sharing on GitHub, always distribute `.env.example` so contributors can configure their own local `.env` keys.
