// backend/api/index.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

// load env
dotenv.config();

import authRoutes from "../routes/auth.js";
import cartRoutes from "../routes/cart.js";
import productRoutes from "../routes/products.js";

console.log("🚀 Starting E-commerce Backend...");
console.log("🔧 NODE_ENV:", process.env.NODE_ENV || "development");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// debug request logger (light)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce_local";

// centralized connect function
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected:", mongoose.connection.db.databaseName);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

// Attach routes (no DB connect required to register routes)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Basic root
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running 🚀",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/products",
      "GET /api/products/:id",
      "POST /api/products/add",
      "GET /api/cart",
      "POST /api/cart/add",
      "DELETE /api/cart/remove/:itemId"
    ]
  });
});

// Health endpoint ensures DB connect and returns minimal stats
app.get("/health", async (req, res) => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    // count documents safely (if empty collections exist it will return 0)
    const counts = {};
    for (const c of collections) {
      counts[c.name] = await db.collection(c.name).countDocuments();
    }

    res.json({
      status: "healthy",
      serverTime: new Date().toISOString(),
      database: {
        name: db.databaseName,
        readyState: mongoose.connection.readyState,
        collections: counts
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "unhealthy", error: error.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server when run locally (Vercel will import the app)
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📡 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Only start when this file is run directly (keep export for serverless)
if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;
export { connectDB };

