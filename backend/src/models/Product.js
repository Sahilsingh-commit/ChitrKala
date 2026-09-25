import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    description_hi: {
      type: String,
      default: "",
    },
    image: {
      type: String, // Base64 data URI or external URL
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      default: "Handmade Craft",
    },
    is_handmade: {
      type: Boolean,
      default: true,
    },
    contact_phone: {
      type: String,
      default: "919876543210",
    },
    tags: [
      {
        type: String,
      },
    ],
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Using explicit created_at field as requested
  }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
