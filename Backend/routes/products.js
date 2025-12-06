// backend/routes/products.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get all products or search
router.get("/", async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).populate("seller_id", "username email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by seller
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const products = await Product.find({ seller_id: req.params.sellerId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add product (seller only)
router.post("/add", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ message: "Only sellers can add products" });

    const { name, description, price, category, image_url, stock } = req.body;
    if (!name || price == null) return res.status(400).json({ message: "Name and price are required" });

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      seller_id: req.user.id,
      category,
      image_url,
      stock: stock || 100
    });

    res.json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
