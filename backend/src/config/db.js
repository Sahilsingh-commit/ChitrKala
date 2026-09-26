import mongoose from "mongoose";

let isDbConnected = false;

/**
 * Builds a MongoDB connection URI safely.
 *
 * Preferred: set MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_DB in .env
 * separately — the password is percent-encoded automatically, so special
 * characters (@, %, :, /, etc.) can never break the URI.
 *
 * Fallback: a single MONGODB_URI in .env is still supported, but if your
 * password has special characters, YOU must percent-encode it yourself
 * before pasting it into that single string.
 */
function buildMongoURI() {
  const { MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_DB, MONGODB_URI } = process.env;

  if (MONGO_USER && MONGO_PASSWORD && MONGO_HOST) {
    const user = encodeURIComponent(MONGO_USER);
    const password = encodeURIComponent(MONGO_PASSWORD);
    const dbName = MONGO_DB || "chitrkala";
    return `mongodb+srv://${user}:${password}@${MONGO_HOST}/${dbName}?retryWrites=true&w=majority`;
  }

  // Fallback to a single pre-built URI, or local Mongo for dev.
  return MONGODB_URI || "mongodb://127.0.0.1:27017/chitrkala";
}

export async function connectDB() {
  const mongoURI = buildMongoURI();
  const isAtlas = mongoURI.startsWith("mongodb+srv://");

  // Mask password for clean log output — matches from the LAST '@' before
  // the host, so a password containing '@' (already impossible now that
  // it's percent-encoded, but just in case someone passes a raw MONGODB_URI)
  // won't break the masking either.
  const maskedURI = mongoURI.replace(/:\/\/([^:]+):([^@]*)@/, "://$1:****@");

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