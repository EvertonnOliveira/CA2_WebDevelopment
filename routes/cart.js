/* ============================================================
   routes/cart.js — API endpoints for shopping cart management
   
   The cart is stored in the MySQL database (cart_items table)
   linked to a session_id. The session_id is generated in the
   browser (stored in localStorage) and sent with every request
   as a query parameter or in the request body.
   
   Why session_id instead of user accounts?
   For this CA we keep it simple — no login required to use the cart.
   Each browser gets a unique ID on first visit. In a real app
   this would be replaced by authenticated user sessions.

   Endpoints:
     GET    /api/cart?session_id=xxx       — get all items in cart
     POST   /api/cart                      — add item to cart
     DELETE /api/cart/:productId?session_id=xxx  — remove item from cart
     DELETE /api/cart?session_id=xxx       — clear entire cart
   ============================================================ */

const express = require('express');

module.exports = function(db) {

  const router = express.Router();


  /* ----------------------------------------------------------
     GET /api/cart?session_id=xxx
     Returns all items currently in the cart for this session,
     joined with product details (name, price) from the products table.
     ---------------------------------------------------------- */
  router.get('/', (req, res) => {

    /* session_id comes from the URL query string: ?session_id=abc123
       req.query holds all query string parameters as an object */
    const { session_id } = req.query;

    if (!session_id) {
      /* 400 Bad Request: the client didn't send a session_id */
      return res.status(400).json({ error: 'session_id is required.' });
    }

    /* JOIN query: combines cart_items with products so the response
       includes the product name and price, not just the product_id.
       
       Why JOIN instead of two separate queries?
       A single JOIN is more efficient — one round-trip to MySQL
       instead of two. The ON clause matches cart rows to product rows. */
    const sql = `
      SELECT
        ci.id          AS cart_item_id,
        ci.product_id,
        ci.quantity,
        p.name         AS product_name,
        p.price        AS product_price,
        p.description  AS product_description,
        (ci.quantity * p.price) AS line_total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.session_id = ?
      ORDER BY ci.created_at ASC
    `;

    db.query(sql, [session_id], (err, results) => {
      if (err) {
        console.error('Error fetching cart:', err.message);
        return res.status(500).json({ error: 'Failed to fetch cart.' });
      }

      /* Calculate the cart total by summing all line_totals.
         toFixed(2) formats to 2 decimal places for currency display. */
      const total = results.reduce((sum, item) => sum + parseFloat(item.line_total), 0);

      res.status(200).json({
        items: results,
        total: total.toFixed(2),
        item_count: results.length
      });
    });
  });


  /* ----------------------------------------------------------
     POST /api/cart
     Adds a product to the cart, or increases quantity if it
     already exists (using INSERT ... ON DUPLICATE KEY UPDATE).
     
     Request body (JSON):
       { "session_id": "abc123", "product_id": 2, "quantity": 1 }
     ---------------------------------------------------------- */
  router.post('/', (req, res) => {

    const { session_id, product_id, quantity } = req.body;

    /* Validate required fields before touching the database */
    if (!session_id || !product_id) {
      return res.status(400).json({ error: 'session_id and product_id are required.' });
    }

    /* Default quantity to 1 if not provided; ensure it's a positive integer */
    const qty = parseInt(quantity) || 1;

    /* INSERT ... ON DUPLICATE KEY UPDATE:
       - If no row exists for (session_id, product_id), INSERT a new row
       - If a row already exists (the UNIQUE KEY on those two columns),
         UPDATE the quantity instead of creating a duplicate
       
       This is more efficient than checking existence first with a SELECT,
       then deciding whether to INSERT or UPDATE — that approach requires
       two queries; this does it in one. */
    const sql = `
      INSERT INTO cart_items (session_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    db.query(sql, [session_id, product_id, qty], (err, result) => {
      if (err) {
        console.error('Error adding to cart:', err.message);
        return res.status(500).json({ error: 'Failed to add item to cart.' });
      }

      /* 201 Created: item was added or updated successfully */
      res.status(201).json({ message: 'Item added to cart.', affectedRows: result.affectedRows });
    });
  });


  /* ----------------------------------------------------------
     DELETE /api/cart/:productId?session_id=xxx
     Removes a specific product from the cart.
     
     :productId — URL parameter (the product to remove)
     session_id — query string (identifies whose cart to modify)
     ---------------------------------------------------------- */
  router.delete('/:productId', (req, res) => {

    const { session_id } = req.query;
    const { productId }  = req.params;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required.' });
    }

    /* Delete only the row matching BOTH session_id AND product_id.
       Both conditions are required — without session_id we might
       delete the same product from another user's cart. */
    const sql = 'DELETE FROM cart_items WHERE session_id = ? AND product_id = ?';

    db.query(sql, [session_id, productId], (err, result) => {
      if (err) {
        console.error('Error removing from cart:', err.message);
        return res.status(500).json({ error: 'Failed to remove item.' });
      }

      if (result.affectedRows === 0) {
        /* 404: the item wasn't in the cart to begin with */
        return res.status(404).json({ error: 'Item not found in cart.' });
      }

      res.status(200).json({ message: 'Item removed from cart.' });
    });
  });


  /* ----------------------------------------------------------
     DELETE /api/cart?session_id=xxx
     Clears the entire cart for a session (used after checkout).
     ---------------------------------------------------------- */
  router.delete('/', (req, res) => {

    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required.' });
    }

    const sql = 'DELETE FROM cart_items WHERE session_id = ?';

    db.query(sql, [session_id], (err) => {
      if (err) {
        console.error('Error clearing cart:', err.message);
        return res.status(500).json({ error: 'Failed to clear cart.' });
      }

      res.status(200).json({ message: 'Cart cleared.' });
    });
  });


  return router;
};
