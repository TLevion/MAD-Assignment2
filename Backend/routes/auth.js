// backend/routes/auth.js - UPDATED
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "MGGUPOFTC@1234";

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Username, email, and password are required" });
    }
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) return res.status(400).json({ success: false, message: "Email already registered" });
      if (existingUser.username === username) return res.status(400).json({ success: false, message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "buyer"
    });

    // ✅ FIX: Include _id in JWT payload for consistency
    const token = jwt.sign({ 
      _id: user._id, 
      id: user._id, // Include both for compatibility
      username: user.username, 
      email: user.email, 
      role: user.role 
    }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      // ✅ FIX: Send consistent user object with _id
      user: { 
        _id: user._id,
        id: user._id, // Include both
        username: user.username, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // ✅ FIX: Include _id in JWT payload for consistency
    const token = jwt.sign({ 
      _id: user._id,
      id: user._id, // Include both for compatibility
      username: user.username, 
      email: user.email, 
      role: user.role 
    }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      // ✅ FIX: Send consistent user object with _id
      user: { 
        _id: user._id,
        id: user._id, // Include both
        username: user.username, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// Add this logout endpoint to clear server-side sessions if needed
router.post("/logout", (req, res) => {
  // For JWT, logout is client-side, but we can have this endpoint for future use
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;