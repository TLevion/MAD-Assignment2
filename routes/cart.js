import express from "express";
import db from "../db.js";

const router = express.Router();

// Get cart items for a user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  // Join cart_items -> cart -> products to get full product info
  const sql = `
    SELECT 
      ci.id AS cart_item_id,
      p.id AS product_id,
      p.name,
      p.price,
      p.image_url,
      ci.quantity
    FROM cart_items ci
    JOIN cart c ON ci.cart_id = c.id
    JOIN products p ON ci.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// Add item to cart
router.post("/add", (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  // Find or create cart for the user
  db.query("SELECT id FROM cart WHERE user_id = ?", [user_id], (err, carts) => {
    if (err) return res.status(500).json({ message: err.message });

    let cartId;
    if (carts.length > 0) {
      cartId = carts[0].id;
      insertCartItem(cartId);
    } else {
      // Create new cart
      db.query("INSERT INTO cart (user_id) VALUES (?)", [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        cartId = result.insertId;
        insertCartItem(cartId);
      });
    }

    function insertCartItem(cartId) {
      db.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cartId, product_id, quantity],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: "Item added to cart" });
        }
      );
    }
  });
});

export default router;
