-- ============================================================
-- database.sql — Irish Sponsorship Jobs
-- This script creates the database, tables, and inserts
-- the sample products needed to run the project.
--
-- How to run:
--   mysql -u root -p < db/database.sql
-- ============================================================


-- Create the database if it doesn't exist yet
CREATE DATABASE IF NOT EXISTS `irish_sponsorship_db`;

-- Tell MySQL to use this database for all commands below
USE `irish_sponsorship_db`;


-- ============================================================
-- TABLE: products
-- Stores all subscription services available on the website.
-- Products are fetched by the Node.js server and displayed
-- dynamically on the services.html page.
-- ============================================================

-- Remove the table first if it already exists (clean start)
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  -- Auto-incrementing ID used as the primary key
  `id` int NOT NULL AUTO_INCREMENT,

  -- Product name shown on the services page
  `name` varchar(100) NOT NULL,

  -- Short description shown inside the pricing card
  `description` text,

  -- Price in euros, stored with 2 decimal places
  `price` decimal(10,2) NOT NULL,

  -- Category used to filter and style cards (e.g. 'preparation', 'visa', 'bundle')
  `category` varchar(50) DEFAULT NULL,

  -- List of features stored as a JSON array
  -- e.g. ["CV Review", "Mock Interview", "Email support"]
  `features` json DEFAULT NULL,

  -- 1 = product is visible on the site, 0 = hidden/archived
  `is_active` tinyint(1) DEFAULT '1',

  -- Automatically records when the product was created
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- TABLE: cart_items
-- Stores the shopping cart for each browser session.
-- Each row links a session (user) to a product they added.
-- The session_id is generated in the browser and stored
-- in localStorage — no login required.
-- ============================================================

CREATE TABLE `cart_items` (
  -- Auto-incrementing ID for each cart row
  `id` int NOT NULL AUTO_INCREMENT,

  -- Unique browser session ID (generated in JavaScript)
  -- Links the cart to a specific user without needing a login
  `session_id` varchar(100) NOT NULL,

  -- Which product was added — references the products table
  `product_id` int NOT NULL,

  -- How many of this product the user wants (default is 1)
  `quantity` int DEFAULT '1',

  -- Automatically records when the item was added to the cart
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  -- Prevents duplicate rows: one session can only have one row per product.
  -- If the same product is added again, the quantity is increased instead.
  UNIQUE KEY `unique_cart_item` (`session_id`, `product_id`),

  -- Index on product_id speeds up JOIN queries with the products table
  KEY `product_id` (`product_id`),

  -- Foreign key: product_id must exist in the products table.
  -- This enforces data integrity — you cannot add a product to the
  -- cart if that product does not exist.
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- SEED DATA: products
-- Inserts the 5 subscription services into the products table.
-- This data is what appears on the services.html page.
-- ============================================================

INSERT INTO `products` (`name`, `description`, `price`, `category`, `features`) VALUES
(
  'CV Review',
  'Professional review of your CV tailored for the Irish job market.',
  29.99,
  'preparation',
  '["Personalised written feedback", "LinkedIn profile tips", "ATS optimisation advice", "48h turnaround"]'
),
(
  'Interview Prep',
  'One-to-one mock interview session with detailed feedback.',
  49.99,
  'preparation',
  '["60-minute mock interview", "Industry-specific questions", "Feedback report", "Recording available"]'
),
(
  'Visa Application Guide',
  'Step-by-step guide for the Irish Critical Skills Employment Permit.',
  19.99,
  'visa',
  '["Full permit process walkthrough", "Document checklist", "Timeline planning", "FAQ included"]'
),
(
  'Country Guide – Ireland',
  'Everything you need to know about working and living in Ireland.',
  14.99,
  'guide',
  '["Cost of living breakdown", "Top employers by sector", "City comparison: Dublin vs Cork vs Galway", "Cultural tips"]'
),
(
  'Full Sponsorship Bundle',
  'Everything included — best value for serious candidates.',
  89.99,
  'bundle',
  '["CV Review", "Mock Interview", "Visa Guide", "Country Guide", "Email support for 30 days"]'
);