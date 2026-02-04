/**
 * Unit Tests for Product Routes
 * Tests individual route handlers WITHOUT hitting any database
 * Uses ONLY mocks - no real database operations
 */

const express = require('express');
const request = require('supertest');

// Mock database module - NO real database calls
const mockDb = {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn(),
  prepare: jest.fn(() => ({
    run: jest.fn(),
    finalize: jest.fn()
  }))
};

// Mock the database module completely
jest.mock('../../database', () => mockDb);

// Prevent any setup.js from running
jest.mock('../setup', () => {});

// Import routes after mocking
const productRoutes = require('../../routes/products');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Routes Unit Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    test('should return all products successfully', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 99.99, created_at: '2024-01-01' },
        { id: 2, name: 'Product 2', price: 149.99, created_at: '2024-01-02' }
      ];

      // Mock successful database response
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockProducts);
      });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProducts,
        count: 2
      });

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM Products ORDER BY id DESC',
        [],
        expect.any(Function)
      );
    });

    test('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');

      // Mock database error
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Database connection failed'
      });
    });

    test('should return empty array when no products found', async () => {
      // Mock empty result
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return specific product by ID', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 99.99, created_at: '2024-01-01' };

      // Mock successful database response
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockProduct);
      });

      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProduct
      });

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM Products WHERE id = ?',
        ['1'],
        expect.any(Function)
      );
    });

    test('should return 404 when product not found', async () => {
      // Mock product not found
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Product not found'
      });
    });

    test('should handle database errors on single product fetch', async () => {
      const mockError = new Error('Database error');

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .get('/api/products/1')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Database error'
      });
    });
  });

  describe('POST /api/products', () => {
    test('should create new product successfully', async () => {
      const newProduct = { name: 'New Product', price: 199.99 };
      const mockInsertResult = { lastID: 3, changes: 1 };

      // Mock successful insert
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call(mockInsertResult, null);
      });

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Product created successfully',
        data: {
          id: 3,
          name: 'New Product',
          price: 199.99
        }
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO Products (name, price) VALUES (?, ?)',
        ['New Product', 199.99],
        expect.any(Function)
      );
    });

    test('should validate required fields', async () => {
      const incompleteProduct = { name: 'Product without price' };

      const response = await request(app)
        .post('/api/products')
        .send(incompleteProduct)
        .expect(400);

      expect(response.body.message).toContain('required');
      expect(mockDb.run).not.toHaveBeenCalled();
    });

    test('should validate price is a number', async () => {
      const invalidProduct = { name: 'Product', price: 'not-a-number' };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.message).toContain('number');
      expect(mockDb.run).not.toHaveBeenCalled();
    });

    test('should validate price is positive', async () => {
      const negativePrice = { name: 'Product', price: -10.99 };

      const response = await request(app)
        .post('/api/products')
        .send(negativePrice)
        .expect(400);

      expect(response.body.message).toContain('positive');
      expect(mockDb.run).not.toHaveBeenCalled();
    });

    test('should handle database errors on insert', async () => {
      const newProduct = { name: 'New Product', price: 199.99 };
      const mockError = new Error('Insert failed');

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(mockError);
      });

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Insert failed'
      });
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update product successfully', async () => {
      const updateData = { name: 'Updated Product', price: 299.99 };
      const mockUpdateResult = { changes: 1 };

      // Mock successful update
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call(mockUpdateResult, null);
      });

      const response = await request(app)
        .put('/api/products/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Product updated successfully',
        data: {
          id: 1,
          name: 'Updated Product',
          price: 299.99
        }
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE Products SET name = ?, price = ? WHERE id = ?',
        ['Updated Product', 299.99, '1'],
        expect.any(Function)
      );
    });

    test('should return 404 when updating non-existent product', async () => {
      const updateData = { name: 'Updated Product', price: 299.99 };
      const mockUpdateResult = { changes: 0 };

      // Mock no changes (product not found)
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call(mockUpdateResult, null);
      });

      const response = await request(app)
        .put('/api/products/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Product not found'
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete product successfully', async () => {
      const mockDeleteResult = { changes: 1 };

      // Mock successful delete
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call(mockDeleteResult, null);
      });

      const response = await request(app)
        .delete('/api/products/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Product deleted successfully'
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM Products WHERE id = ?',
        ['1'],
        expect.any(Function)
      );
    });

    test('should return 404 when deleting non-existent product', async () => {
      const mockDeleteResult = { changes: 0 };

      // Mock no changes (product not found)
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call(mockDeleteResult, null);
      });

      const response = await request(app)
        .delete('/api/products/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Product not found'
      });
    });

    test('should handle database errors on delete', async () => {
      const mockError = new Error('Delete failed');

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(mockError);
      });

      const response = await request(app)
        .delete('/api/products/1')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Delete failed'
      });
    });
  });
});