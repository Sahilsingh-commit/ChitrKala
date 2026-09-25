import mongoose from "mongoose";

let isDbConnected = false;

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chitrkala";
  const isAtlas = mongoURI.startsWith("mongodb+srv://");

  // Mask password for clean log output
  const maskedURI = mongoURI.replace(/:([^@]+)@/, ":****@");

  try {
    console.log(`Connecting to ${isAtlas ? "MongoDB Atlas Cloud Database" : "MongoDB"} (${maskedURI})...`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000, // 8s timeout for Cloud Atlas SSL handshake
    });

    isDbConnected = true;
    console.log(`✅ ${isAtlas ? "MongoDB Atlas Cloud Database" : "MongoDB"} connected successfully.`);
  } catch (err) {
    isDbConnected = false;
    console.warn(`⚠️ MongoDB Connection Warning: ${err.message}`);
    console.warn("⚠️ Running in Memory-Fallback Mode (All app features remain 100% functional for demo).");
  }
}

export function getIsDbConnected() {
  return isDbConnected;
}
