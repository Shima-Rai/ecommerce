/**
 * Global test setup and teardown
 * This file is run before all tests to set up the testing environment
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Test database path (separate from production database)
const TEST_DB_PATH = path.join(__dirname, '../test_ecommerce.db');

// Global test database instance
let testDb;

// Setup before all tests
beforeAll(async () => {
  console.log('Setting up test database...');
  
  // Create test database
  testDb = new sqlite3.Database(TEST_DB_PATH);
  
  // Initialize test database with same schema as production
  await initializeTestDatabase();
  
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  process.env.TEST_DB_PATH = TEST_DB_PATH;
});

// Cleanup after all tests
afterAll(async () => {
  console.log('Cleaning up test database...');
  
  if (testDb) {
    await new Promise((resolve) => {
      testDb.close((err) => {
        if (err) {
          console.error('Error closing test database:', err.message);
        } else {
          console.log('Test database closed');
        }
        resolve();
      });
    });
  }
  
  // Longer delay to ensure file is released on Windows
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clean up test database file with retry logic
  const fs = require('fs');
  if (fs.existsSync(TEST_DB_PATH)) {
    let retries = 3;
    while (retries > 0) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
        console.log('Test database file deleted');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          // This is a common Windows file locking issue - not critical
          console.log('Note: Test database file could not be deleted (Windows file lock)');
          console.log('File will be overwritten in next test run');
        } else {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
  }
});

// Reset database before each test
beforeEach(async () => {
  await clearTestDatabase();
  await seedTestData();
});

/**
 * Initialize test database with same schema as production
 */
async function initializeTestDatabase() {
  return new Promise((resolve, reject) => {
    testDb.serialize(() => {
      // Create Products table
      testDb.run(`
        CREATE TABLE IF NOT EXISTS Products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating Products table:', err.message);
          reject(err);
          return;
        }
      });

      // Create Orders table
      testDb.run(`
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
          reject(err);
          return;
        }
      });

      // Create Users table for authentication
      testDb.run(`
        CREATE TABLE IF NOT EXISTS Users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating Users table:', err.message);
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

/**
 * Clear all test data from database
 */
async function clearTestDatabase() {
  return new Promise((resolve) => {
    testDb.serialize(() => {
      testDb.run('DELETE FROM Orders');
      testDb.run('DELETE FROM Products');
      testDb.run('DELETE FROM Users');
      testDb.run('DELETE FROM sqlite_sequence', () => {
        resolve();
      });
    });
  });
}

/**
 * Seed test database with sample data
 */
async function seedTestData() {
  return new Promise((resolve) => {
    testDb.serialize(() => {
      // Insert test products
      const productStmt = testDb.prepare(`
        INSERT INTO Products (name, price) VALUES (?, ?)
      `);
      
      const testProducts = [
        ['Test Laptop', 999.99],
        ['Test Phone', 599.99],
        ['Test Headphones', 199.99]
      ];
      
      testProducts.forEach(product => {
        productStmt.run(product);
      });
      productStmt.finalize();

      // Insert test user
      const userStmt = testDb.prepare(`
        INSERT INTO Users (username, email, password) VALUES (?, ?, ?)
      `);
      
      // Password is 'testpass123' hashed with bcrypt
      const testUsers = [
        ['testuser', 'test@example.com', '$2a$10$8K1p/a0dURXAikcnbzZx4.5TQX5YfIkzJlqczwVJgdXjy4yiYUF26']
      ];
      
      testUsers.forEach(user => {
        userStmt.run(user);
      });
      userStmt.finalize(() => {
        resolve();
      });
    });
  });
}

// Export test database for use in tests
module.exports = { 
  get testDb() { return testDb; },
  TEST_DB_PATH 
};