# ChitrKala — Artisan AI Studio & Auto-Cataloger

**SIH26090** — Smart India Hackathon 2026

An AI-powered web app that turns a product photo and a voice note into a professional, priced, multilingual e-commerce listing — transforming a multi-day manual digitization struggle into a single scan-and-speak action.

---

## 🎥 Demo

**Video walkthrough:** _[coming soon]_

---

## 📋 The Problem

Millions of marginalized artisans across India — many home-based, many with limited literacy or smartphone comfort — still rely on temporary physical fairs and PM Vishwakarma-style schemes for market access. Getting a product online today means writing a description, photographing it well, and guessing a fair price, none of which are easy without training:

- **No year-round digital market access** — sales are tied to seasonal fairs, not a standing storefront
- **Poor product presentation** — phone photos aren't e-commerce ready, and most artisans have no photo-editing skill or tools
- **Language & literacy barriers** — listing forms assume typing and English/text fluency neither always exist
- **No awareness of fair, competitive pricing** — artisans routinely under- or over-price work relative to the market, with no benchmark to check against

## 💡 Our Solution

An artisan photographs their product and records a short voice note describing it, in whatever language they're comfortable in. From that single capture, ChitrKala automatically:

1. Enhances and formats the photo into a studio-quality e-commerce image (background removal + cleanup)
2. Transcribes and interprets the voice note into a structured product description
3. Generates a bilingual (English + Hindi) title and description
4. Benchmarks the product against category-matched reference pricing and shows a low / recommended / high range with reasoning
5. Requires the artisan to confirm a final price before anything goes live
6. Publishes the confirmed listing to a public buyer marketplace, with a direct WhatsApp contact link to the artisan

What used to take a multi-day round trip through a photographer, a translator, and a market survey now takes one photo and one voice note.

## ✨ Key Features

- 📸 **AI Image Studio** — local, on-device background removal (ONNX model) plus image cleanup/formatting, no cloud image API required
- 🎙️ **Voice-first cataloging** — record a description in any language, no typing required
- 🌐 **Bilingual listing generation** — auto-detects the spoken language and produces English + Hindi title/description
- 💰 **AI Pricing Assistant** — category-matched reference pricing (low / recommended / high) with transparent reasoning, compared against the artisan's own expected price
- ✅ **Mandatory final-price confirmation** — nothing publishes until the artisan explicitly confirms a selling price
- 🚀 **One-click publish to marketplace** — confirmed listings go live on a public, buyer-facing marketplace page
- 🛍️ **Buyer marketplace** — browsable product cards (image, title, price, handmade tag, description), no cart or payment flow — this is a discovery + contact tool, not a full storefront
- 💬 **Direct contact seller** — buyers reach the artisan straight over WhatsApp, no middleman
- 🔗 **Shareable product links** — each listing gets its own shareable URL for WhatsApp/social sharing
- 🔐 **Artisan accounts** — JWT-based authentication so listings and contact details are tied to a real seller profile

## 🏗️ Architecture

```
Client (React + Vite, React Router)
        │  REST / multipart
        ▼
Node.js / Express Backend
   ├── Auth (JWT + bcrypt)
   ├── Image Studio (local ONNX background removal + Sharp/Jimp processing)
   ├── Voice → Listing Generation (Google Gemini API)
   ├── Pricing Engine (category-matched reference benchmarking)
   ├── Listings Service (draft → confirm → publish)
   └── Marketplace API (public read endpoints for buyers)
        │
        ▼
MongoDB (via Mongoose)
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router DOM |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |
| AI / Listing Generation | Google Gemini API (`@google/genai`) |
| Image Processing | `@imgly/background-removal-node` (local ONNX bg removal), `sharp`, `jimp` |
| File Uploads | `multer` |
| Config | `dotenv`, `cors` |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- A MongoDB connection string (local or Atlas)
- A Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/Sahilsingh-commit/ChitrKala.git
cd ChitrKala
```

### 2. Set up the backend
```bash
cd backend
npm install
# create a .env file — see .env.example
# required: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm start
```

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Navigate to the local URL Vite prints (typically `http://localhost:5173`).

> **Note:** `web-demo/` in this repo is an earlier static prototype used during development and is not the current application — use `frontend/` + `backend/` above.

## 📖 API Overview

> Endpoint paths below reflect the current listing/marketplace flow; see `backend/src/routes/` for the exact, up-to-date route definitions.

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Create an artisan account |
| `/api/auth/login` | POST | Authenticate and receive a JWT |
| `/api/listings/generate` | POST | Accepts a product photo + voice note, returns studio image, bilingual listing, and pricing benchmark |
| `/api/listings` | POST | Publish a confirmed listing (with final price) to the marketplace |
| `/api/listings` | GET | Fetch all published listings (marketplace view) |
| `/api/listings/:id` | GET | Fetch a single published listing (product/share view) |

## ⚠️ Known Limitations

We believe in documenting real, tested limitations rather than hiding them. Key ones:

- Pricing is generated from category-matched reference data, not live marketplace scraping — accuracy depends on how well a product's category matches our reference set
- Voice-to-listing accuracy depends on Gemini's handling of the spoken language/dialect; no manual-correction feedback loop exists yet
- No offline-first capture yet — an active connection is required end-to-end
- Marketplace intentionally has no cart, checkout, or payment processing — by design, this is a discovery-and-contact tool, not a transacting e-commerce platform

## 🗺️ Roadmap

-  GeM / PM Vishwakarma marketplace integration
-  Offline-first capture (store now, sync later) for low-connectivity areas
-  Confidence-based fallback to manual text entry for low-confidence voice input
-  Expanded regional language support beyond Hindi
-  Basic analytics for artisans (views/enquiries per listing)
-  Reference-price dataset expansion across more craft categories

## 👥 Team members

Sahil, Puneet kumar, Aditya ray, Neeraj kumar Rana, Akshat gautam and Yashita Bijlani.

**Team Name:** Metric Vision
**Team ID:** 173371

## 📚 References

- [PM Vishwakarma Scheme](https://pmvishwakarma.gov.in/) — Ministry of Micro, Small & Medium Enterprises, Government of India
- [GeM (Government e Marketplace)](https://gem.gov.in/) — for B2B/institutional artisan market linkage context
- [Bhashini](https://bhashini.gov.in/) — National Language Translation Mission, referenced for regional-language ecosystem alignment

---

*Built for Smart India Hackathon 2026 — Problem Statement SIH26090*