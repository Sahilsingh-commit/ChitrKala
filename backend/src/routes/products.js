import { Router } from "express";
import Product from "../models/Product.js";
import { getIsDbConnected } from "../config/db.js";

const router = Router();

// Seeded memory array fallback when MongoDB is offline
const memoryProducts = [
  {
    _id: "prod_1",
    title: "Handcrafted Madhubani Peacock Canvas",
    description: "Authentic handmade Madhubani painting created using natural dyes and traditional nib techniques on handmade paper.",
    description_hi: "प्राकृतिक रंगों और पारंपरिक निब तकनीकों का उपयोग करके बनाया गया प्रामाणिक हस्तनिर्मित मधुबनी चित्र।",
    price: 4500,
    category: "Madhubani Painting",
    is_handmade: true,
    tags: ["madhubani", "canvas", "handmade", "peacock", "folk art"],
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    contact_phone: "919876543210",
    created_at: new Date(Date.now() - 86400000),
  },
  {
    _id: "prod_2",
    title: "Pure Banarasi Silk Handloom Saree",
    description: "Exquisite handwoven Banarasi silk saree featuring classic zari brocade work and intricate floral motifs.",
    description_hi: "उत्कृष्ट हथकरघा बनारसी सिल्क साड़ी जिसमें पारंपरिक जरी ब्रोकैड और जटिल पुष्प डिजाइन शामिल हैं।",
    price: 14500,
    category: "Banarasi Saree",
    is_handmade: true,
    tags: ["banarasi", "saree", "silk", "handloom", "zari"],
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    contact_phone: "919876543210",
    created_at: new Date(Date.now() - 43200000),
  },
];

// GET /api/products - Get all marketplace products from MongoDB (or fallback)
router.get("/products", async (req, res) => {
  try {
    const isDb = getIsDbConnected();

    if (isDb) {
      const dbProducts = await Product.find().sort({ created_at: -1 }).lean();
      return res.json({
        success: true,
        source: "mongodb",
        products: dbProducts,
      });
    } else {
      return res.json({
        success: true,
        source: "memory_fallback",
        products: memoryProducts,
      });
    }
  } catch (err) {
    console.error("Fetch Products Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products: " + err.message,
    });
  }
});

// POST /api/products - Post a new product listing to MongoDB (or fallback)
router.post("/products", async (req, res) => {
  const {
    title,
    description,
    description_en,
    description_hi,
    price,
    category,
    is_handmade = true,
    tags = [],
    image,
    contact_phone,
    phone = "919876543210",
  } = req.body;

  if (!title || price === undefined || price === null) {
    return res.status(400).json({
      success: false,
      error: "Title and price are required to post a product.",
    });
  }

  const finalDescription = description || description_en || "Artisan handmade craft piece.";
  const finalPhone = contact_phone || phone || "919876543210";

  try {
    const isDb = getIsDbConnected();
    let newProduct;

    if (isDb) {
      newProduct = await Product.create({
        title,
        description: finalDescription,
        description_hi: description_hi || "दस्तकार द्वारा हस्तनिर्मित कलाकृति।",
        price: parseFloat(price),
        category: category || "Handmade Craft",
        is_handmade: Boolean(is_handmade),
        tags: Array.isArray(tags) ? tags : [],
        image: image || null,
        contact_phone: finalPhone,
        created_at: new Date(),
      });
    } else {
      newProduct = {
        _id: `prod_${Date.now()}`,
        title,
        description: finalDescription,
        description_hi: description_hi || "दस्तकार द्वारा हस्तनिर्मित कलाकृति।",
        price: parseFloat(price),
        category: category || "Handmade Craft",
        is_handmade: Boolean(is_handmade),
        tags: Array.isArray(tags) ? tags : [],
        image: image || null,
        contact_phone: finalPhone,
        created_at: new Date(),
      };
      memoryProducts.unshift(newProduct);
    }

    console.log(`New product posted to marketplace: ${newProduct.title} (₹${newProduct.price})`);

    res.status(201).json({
      success: true,
      source: isDb ? "mongodb" : "memory_fallback",
      product: newProduct,
    });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to post product: " + err.message,
    });
  }
});

export default router;
