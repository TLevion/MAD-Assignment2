// products.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all products or search by query
router.get("/", (req, res) => {
  const q = req.query.q || ""; // if q exists, search; else return all
  let sql = "SELECT * FROM products";
  const params = [];

  if (q) {
    sql += " WHERE name LIKE ? OR description LIKE ?";
    params.push(`%${q}%`, `%${q}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// Get products by seller
router.get("/seller/:sellerId", (req, res) => {
  const { sellerId } = req.params;
  db.query("SELECT * FROM products WHERE seller_id = ?", [sellerId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// Add product
router.post("/add", (req, res) => {
  const { name, description, price, seller_id, image_url } = req.body;
  if (!name || !price || !seller_id) return res.status(400).json({ message: "Required fields missing" });

  const sql = "INSERT INTO products (name, description, price, seller_id, image_url) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, description || "", price, seller_id, image_url || ""], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Product added successfully", id: result.insertId });
  });
});

export default router;
