# Irish Sponsorship Jobs 🇮🇪

A full-stack e-commerce web application built for CCT College Dublin — Web Development CA2.

The platform helps international candidates find visa-sponsored jobs in Ireland and offers subscription services such as CV reviews, mock interviews, and visa guides.

---

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Node.js + Express.js
- **Database**: MySQL 9.4
- **Other**: dotenv, mysql2, cors

---

## How to Run This Project

### Requirements
- Node.js (v18 or higher)
- MySQL (v8 or higher)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up the database
Log into MySQL and run the provided SQL script:
```bash
mysql -u root -p < db/database.sql
```
This will create the `irish_sponsorship_db` database, the `products` and `cart_items` tables, and insert the 5 sample products.

### Step 3 — Configure environment variables
Create a `.env` file in the project root:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=irish_sponsorship_db
PORT=3000
```

### Step 4 — Start the server
```bash
node server.js
```

### Step 5 — Open in browser
Visit: **http://localhost:3000/home.html**

---

## Project Structure

```
CA2_WebDevelopment/
├── server.js              # Express server — entry point
├── package.json           # Node.js dependencies
├── .env                   # Database credentials (not in GitHub)
├── db/
│   └── database.sql       # MySQL schema + seed data
├── routes/
│   ├── products.js        # GET /api/products
│   └── cart.js            # GET/POST/DELETE /api/cart
├── home.html              # Landing page
├── jobs.html              # Job listings
├── services.html          # Subscription plans (fetched from MySQL)
├── cart.html              # Shopping cart
├── checkout.html          # Checkout with form validation
├── about.html             # About page
├── contact.html           # Contact form with JS validation
├── css/
│   └── style.css          # Global stylesheet
└── js/
    └── script.js          # Contact form validation
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Fetch all active products from MySQL |
| GET | `/api/products/:id` | Fetch a single product by ID |
| GET | `/api/cart?session_id=xxx` | Get cart items for a session |
| POST | `/api/cart` | Add item to cart |
| DELETE | `/api/cart/:productId?session_id=xxx` | Remove item from cart |
| DELETE | `/api/cart?session_id=xxx` | Clear entire cart |

---

## AI Usage Disclosure

As required by CCT assessment policy, this project used Claude (Anthropic) for:
- Brainstorming the e-commerce service ideas (CV Review, Interview Prep, Visa Guide)
- Refining the Node.js/Express server structure
- Debugging MySQL connection issues
- Helping with comments