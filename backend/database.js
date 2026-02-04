const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path - use test database if in test environment
const dbPath = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_DB_PATH || path.join(__dirname, 'test_ecommerce.db')
  : path.join(__dirname, 'ecommerce.db');

// Create and connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Only initialize database if not in test mode (tests handle their own initialization)
    if (process.env.NODE_ENV !== 'test') {
      initializeDatabase();
    }
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating Products table:', err.message);
    } else {
      console.log('Products table ready');
      seedProducts();
    }
  });

  // Create Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS Orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES Products(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating Orders table:', err.message);
    } else {
      console.log('Orders table ready');
    }
  });
}

// Seed initial products if table is empty
function seedProducts() {
  db.get('SELECT COUNT(*) as count FROM Products', (err, row) => {
    if (err) {
      console.error('Error checking products:', err.message);
      return;
    }

    if (row.count === 0) {
      const sampleProducts = [
        ['Laptop', 74699.00],
        ['Wireless Mouse', 2490.00],
        ['Keyboard', 4980.00],
        ['Monitor 24', 16599.00],
        ['USB Cable', 830.00],
        ['Headphones', 6640.00],
        ['Webcam', 4150.00],
        ['Desk Lamp', 2900.00]
      ];

      const stmt = db.prepare('INSERT INTO Products (name, price) VALUES (?, ?)');
      
      sampleProducts.forEach(product => {
        stmt.run(product, (err) => {
          if (err) {
            console.error('Error seeding product:', err.message);
          }
        });
      });

      stmt.finalize(() => {
        console.log('Sample products added to database');
      });
    }
  });
}

module.exports = db;
