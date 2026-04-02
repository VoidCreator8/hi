const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'shop.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      category_id INTEGER,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  // Seed admin account if not exists
  const adminExists = db.prepare('SELECT id FROM admin WHERE username = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', hashedPassword);
  }

  // Seed sample categories if empty
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    insertCategory.run('Electronics', 'Gadgets, devices, and tech accessories');
    insertCategory.run('Clothing', 'Apparel and fashion items');
    insertCategory.run('Home & Garden', 'Furniture, decor, and garden supplies');
    insertCategory.run('Books', 'Fiction, non-fiction, and educational books');
  }

  // Seed sample products if empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const insertProduct = db.prepare(
      'INSERT INTO products (name, price, description, image, category_id, featured) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertProduct.run('Wireless Headphones', 79.99, 'Premium noise-cancelling wireless headphones with 30-hour battery life.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1, 1);
    insertProduct.run('Smart Watch', 199.99, 'Feature-rich smartwatch with health monitoring and GPS.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1, 1);
    insertProduct.run('Laptop Stand', 49.99, 'Ergonomic aluminum laptop stand for better posture.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 1, 0);
    insertProduct.run('Cotton T-Shirt', 24.99, 'Soft organic cotton t-shirt available in multiple colors.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 2, 1);
    insertProduct.run('Denim Jacket', 89.99, 'Classic denim jacket with a modern fit.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 2, 0);
    insertProduct.run('Running Shoes', 129.99, 'Lightweight running shoes with advanced cushioning.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 2, 1);
    insertProduct.run('Table Lamp', 39.99, 'Modern minimalist table lamp with adjustable brightness.', 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400', 3, 0);
    insertProduct.run('Plant Pot Set', 29.99, 'Set of 3 ceramic plant pots in earthy tones.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', 3, 1);
    insertProduct.run('JavaScript: The Good Parts', 19.99, 'Essential reading for any JavaScript developer.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 4, 0);
    insertProduct.run('The Design of Everyday Things', 15.99, 'A classic book on user-centered design principles.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 4, 0);
  }
}

module.exports = { db, initializeDatabase };
