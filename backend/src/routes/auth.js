import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getIsDbConnected } from "../config/db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "chitrkala_secret_key_12345";

// In-memory fallback store for users when DB offline
const memoryUsers = [];

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role = "artisan" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and password are required.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const isDb = getIsDbConnected();
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (isDb) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists.",
        });
      }

      user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      });
    } else {
      // Memory fallback
      const existingUser = memoryUsers.find((u) => u.email === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists.",
        });
      }

      user = {
        _id: `user_${Date.now()}`,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        created_at: new Date(),
      };
      memoryUsers.push(user);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to register user: " + err.message,
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const isDb = getIsDbConnected();
    let user;

    if (isDb) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryUsers.find((u) => u.email === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Logged in successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to login: " + err.message,
    });
  }
});

export default router;
