/* ============================================================
   server.js — Main entry point for the Irish Sponsorship Jobs server
   ============================================================ */

   require('dotenv').config();
   const express = require('express');
   const mysql   = require('mysql2');
   const cors    = require('cors');
   const path    = require('path');
   
   const app = express();
   
   /* ============================================================
      MIDDLEWARE
      ============================================================ */
   app.use(cors());
   app.use(express.json());
   
   /* express.static(): serves all files directly from the project root.
      Changed from 'public' subfolder because the HTML files sit in
      the root of the project, not inside a /public subfolder. */
   app.use(express.static(path.join(__dirname)));
   
   
   /* ============================================================
      DATABASE CONNECTION
      ============================================================ */
   const db = mysql.createConnection({
     host:       process.env.DB_HOST,
     user:       process.env.DB_USER,
     password:   process.env.DB_PASSWORD,
     database:   process.env.DB_NAME,
     socketPath: '/tmp/mysql.sock'
   });
   
   db.connect((err) => {
     if (err) {
       console.error('❌ MySQL connection failed:', err.message);
       console.log('💡 Make sure MySQL is running and your .env credentials are correct.');
       console.log('💡 Run the database.sql script first to create the database and tables.');
       return;
     }
     console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
   });
   
   module.exports.db = db;
   
   
   /* ============================================================
      ROUTES
      ============================================================ */
   const productsRouter = require('./routes/products')(db);
   app.use('/api/products', productsRouter);
   
   const cartRouter = require('./routes/cart')(db);
   app.use('/api/cart', cartRouter);
   
   
   /* ============================================================
      CATCH-ALL ROUTE
      Changed from 'public/home.html' to 'home.html' because the
      HTML files are in the project root, not in a /public subfolder.
      ============================================================ */
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'home.html'));
   });
   
   
   /* ============================================================
      START SERVER
      ============================================================ */
   const PORT = process.env.PORT || 3000;
   
   app.listen(PORT, () => {
     console.log(`🚀 Server running at http://localhost:${PORT}`);
     console.log(`📁 Serving static files from project root`);
     console.log(`🛑 Press Ctrl+C to stop the server`);
   });