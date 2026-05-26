/* ============================================================
   server.js — Main entry point for the Irish Sponsorship Jobs server
   
   This file does three things:
   1. Loads configuration (port, database credentials) from .env
   2. Connects to the MySQL database
   3. Starts an Express HTTP server that:
      - Serves all HTML/CSS/JS files from the /public folder
      - Exposes API routes for products and cart management
   ============================================================ */

/* --- DEPENDENCIES ---
   dotenv:  loads variables from .env into process.env
            Must be called before anything else so DB credentials are available
   express: web framework — handles HTTP requests and routing
   mysql2:  MySQL driver for Node.js (mysql2 is faster and supports Promises)
   cors:    allows the frontend (running on the same origin) to call the API
            without being blocked by the browser's same-origin policy */
require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');

/* --- EXPRESS APP ---
   Creates the Express application instance.
   All middleware and routes are registered on this object. */
const app = express();


/* ============================================================
   MIDDLEWARE
   Middleware functions run on every incoming request, in order.
   ============================================================ */

/* cors(): allows API requests from the browser.
   Without this, browsers block fetch() calls from the HTML pages
   to our API endpoints due to the same-origin policy. */
app.use(cors());

/* express.json(): parses incoming requests with JSON bodies.
   This is needed so that POST/PUT requests (e.g. adding to cart)
   can send data as JSON and we can read it via req.body. */
app.use(express.json());

/* express.static(): serves all files in /public as static assets.
   When the browser requests home.html, style.css, or script.js,
   Express reads and returns the file directly — no route needed.
   This is why we put all HTML/CSS/JS files in the public/ folder. */
app.use(express.static(path.join(__dirname, 'public')));


/* ============================================================
   DATABASE CONNECTION
   mysql2.createConnection() creates a persistent connection
   to the local MySQL server using credentials from .env
   ============================================================ */

   const db = mysql.createConnection({
      host:             process.env.DB_HOST,    /* 'localhost' from .env */
      user:             process.env.DB_USER,   /* 'root' from .env */
      password:         process.env.DB_PASSWORD, /* your MySQL password from .env */
      database:         process.env.DB_NAME, /* 'irish_sponsorship_db' from .env */
      socketPath:       '/tmp/mysql.sock'
    });

/* .connect() opens the TCP connection to MySQL.
   The callback receives an error if the connection fails
   (e.g. wrong password, MySQL not running, database doesn't exist yet). */
db.connect((err) => {
  if (err) {
    /* Log the error but don't crash — the server still starts
       so we can serve static files even if DB is not ready yet */
    console.error('❌ MySQL connection failed:', err.message);
    console.log('💡 Make sure MySQL is running and your .env credentials are correct.');
    console.log('💡 Run the database.sql script first to create the database and tables.');
    return;
  }
  console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
});

/* Export db so route files (products.js, cart.js) can import
   and reuse the same connection — no need to connect twice */
module.exports.db = db;


/* ============================================================
   ROUTES
   Each route file handles a group of related API endpoints.
   We pass the db connection into each router so they can
   run queries without creating a new connection.
   ============================================================ */

/* Products API — GET /api/products returns all products from MySQL */
const productsRouter = require('./routes/products')(db);
app.use('/api/products', productsRouter);

/* Cart API — GET/POST/DELETE /api/cart manages the shopping cart */
const cartRouter = require('./routes/cart')(db);
app.use('/api/cart', cartRouter);


/* ============================================================
   CATCH-ALL ROUTE
   For any URL that doesn't match a static file or API route,
   serve home.html. This supports client-side navigation
   so refreshing on any page doesn't return a 404.
   ============================================================ */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


/* ============================================================
   START SERVER
   process.env.PORT comes from .env (default 3000).
   The callback logs a message when the server is ready.
   ============================================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from /public`);
  console.log(`🛑 Press Ctrl+C to stop the server`);
});
