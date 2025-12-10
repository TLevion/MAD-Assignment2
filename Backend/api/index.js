// backend/api/index.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config();

import authRoutes from "../routes/auth.js";
import cartRoutes from "../routes/cart.js";
import productRoutes from "../routes/products.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Mongo URI
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce_local";

// ✅ Vercel-safe global cache
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// ✅ Connect once before routes
await connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Root
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running 🚀",
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    dbState: mongoose.connection.readyState,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
