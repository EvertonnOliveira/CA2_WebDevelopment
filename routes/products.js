/* ============================================================
   routes/products.js — API endpoints for subscription products
   
   This file defines the Express router for all product-related
   HTTP requests. It is a function that receives the db connection
   and returns a configured router — this pattern avoids creating
   multiple MySQL connections across different files.

   Endpoints:
     GET  /api/products        — fetch all active products
     GET  /api/products/:id    — fetch a single product by ID
   ============================================================ */

const express = require('express');

/* --- ROUTER FACTORY ---
   We export a function (not the router directly) so server.js
   can pass in the shared db connection:
   const productsRouter = require('./routes/products')(db); */
module.exports = function(db) {

  /* express.Router() creates a mini Express app for this group of routes.
     It is then mounted at /api/products in server.js */
  const router = express.Router();


  /* ----------------------------------------------------------
     GET /api/products
     Returns all products where is_active = 1 (not archived).
     
     Why ORDER BY price ASC?
     Subscription plans are typically displayed cheapest-first
     so users see the entry-level option before premium tiers.
     ---------------------------------------------------------- */
  router.get('/', (req, res) => {

    /* SQL query: SELECT all columns from products table.
       Using a parameterised approach even here (no user input)
       keeps the pattern consistent and safe for future changes. */
    const sql = `
      SELECT 
        id,
        name,
        description,
        price,
        category,
        features
      FROM products
      WHERE is_active = 1
      ORDER BY price ASC
    `;

    /* db.query() sends the SQL to MySQL asynchronously.
       The callback receives (error, results):
         error   — a MySQL error object if the query failed
         results — an array of row objects if successful */
    db.query(sql, (err, results) => {
      if (err) {
        /* 500 Internal Server Error: something went wrong on our side */
        console.error('Error fetching products:', err.message);
        return res.status(500).json({ error: 'Failed to fetch products.' });
      }

      /* Parse the features JSON string back into an array for each product.
         We store features as a JSON string in MySQL because the column
         holds a variable-length list (e.g. ["CV Review", "Mock Interview"]).
         JSON.parse converts it back to a usable array in JavaScript. */
      const products = results.map(product => ({
        ...product,
        features: product.features ? JSON.parse(product.features) : []
      }));

      /* 200 OK: return the products array as JSON */
      res.status(200).json(products);
    });
  });


  /* ----------------------------------------------------------
     GET /api/products/:id
     Returns a single product by its primary key ID.
     Used by the cart and checkout pages to display product details.
     
     :id is a URL parameter — e.g. GET /api/products/2
     ---------------------------------------------------------- */
  router.get('/:id', (req, res) => {

    /* req.params.id captures the :id segment from the URL.
       We use a parameterised query (the ? placeholder) to safely
       insert user-provided values into SQL.
       
       WHY PARAMETERISED QUERIES?
       If we built the SQL string with string concatenation:
         "SELECT * FROM products WHERE id = " + req.params.id
       a malicious user could send id = "1 OR 1=1" and read all data.
       The ? placeholder tells MySQL to treat the value as a literal
       data value, never as SQL syntax — this prevents SQL injection. */
    const sql = 'SELECT * FROM products WHERE id = ? AND is_active = 1';

    db.query(sql, [req.params.id], (err, results) => {
      if (err) {
        console.error('Error fetching product:', err.message);
        return res.status(500).json({ error: 'Failed to fetch product.' });
      }

      /* results is an array; if empty, the product doesn't exist */
      if (results.length === 0) {
        /* 404 Not Found: no product with that ID */
        return res.status(404).json({ error: 'Product not found.' });
      }

      const product = {
        ...results[0],
        features: results[0].features ? JSON.parse(results[0].features) : []
      };

      res.status(200).json(product);
    });
  });


  /* Return the configured router to server.js */
  return router;
};
