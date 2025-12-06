import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get cart items for a user
router.get("/", verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id }).populate({
      path: "items.product_id",
      select: "name price image_url"
    });

    if (!cart) {
      // Return empty cart object to maintain consistency
      cart = { items: [] };
    }

    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) return res.status(400).json({ message: "Product ID and quantity required" });

    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product_id.toString() === product_id);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product_id, quantity: Number(quantity) });
    }

    await cart.save();
    cart = await cart.populate({ path: "items.product_id", select: "name price image_url" });

    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete("/remove/:itemId", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();

    const populatedCart = await cart.populate({ path: "items.product_id", select: "name price image_url" });

    res.json({ message: "Item removed from cart", cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
