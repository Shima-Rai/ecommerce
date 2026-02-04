/**
 * Unit Tests for Order Routes
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
const orderRoutes = require('../../routes/orders');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes Unit Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    test('should create order successfully', async () => {
      const mockProduct = { 
        id: 1, 
        name: 'Test Product', 
        price: 99.99 
      };

      const orderData = {
        product_id: 1,
        quantity: 2
      };

      // Mock product lookup
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockProduct);
      });

      // Mock order insertion
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1, changes: 1 }, null);
      });

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data.order_id).toBe(1);
      expect(response.body.data.product_id).toBe(1);
      expect(response.body.data.product_name).toBe('Test Product');
      expect(response.body.data.quantity).toBe(2);
      expect(response.body.data.total_price).toBe(199.98);
      expect(response.body.data.order_date).toBeDefined();

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM Products WHERE id = ?',
        [1],
        expect.any(Function)
      );
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Product ID and quantity are required'
      });
    });

    test('should validate quantity is positive', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ product_id: 1, quantity: -1 })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    });

    test('should handle product not found', async () => {
      // Mock product not found
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .post('/api/orders')
        .send({ product_id: 999, quantity: 1 })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Product not found'
      });
    });

    test('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');

      // Mock database error on product lookup
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .post('/api/orders')
        .send({ product_id: 1, quantity: 1 })
        .expect(500);

      expect(response.body).toEqual({
        error: 'Database connection failed'
      });
    });
  });

  describe('GET /api/orders', () => {
    test('should return all orders successfully', async () => {
      const mockOrders = [
        { 
          order_id: 1, 
          product_id: 1, 
          product_name: 'Test Product', 
          quantity: 2, 
          total_price: 199.98, 
          order_date: '2026-02-03' 
        }
      ];

      // Mock successful database response
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockOrders);
      });

      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockOrders,
        count: 1
      });
    });

    test('should handle database errors', async () => {
      const mockError = new Error('Database error');

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .get('/api/orders')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Database error'
      });
    });
  });

  describe('PUT /api/orders/:id', () => {
    test('should update order successfully', async () => {
      const mockOrderWithPrice = { 
        order_id: 1, 
        product_id: 1, 
        quantity: 2, 
        total_price: 199.98,
        price: 99.99 // From JOIN with Products table
      };

      const updateData = { quantity: 3 };

      // Mock order lookup with price from JOIN
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockOrderWithPrice);
      });

      // Mock update
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app)
        .put('/api/orders/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order updated successfully');
    });

    test('should return 404 for non-existent order', async () => {
      // Mock order not found (JOIN returns null)
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .put('/api/orders/999')
        .send({ quantity: 1 })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Order not found'
      });
    });
  });

  describe('DELETE /api/orders/:id', () => {
    test('should delete order successfully', async () => {
      // Mock successful deletion
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app)
        .delete('/api/orders/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Order deleted successfully'
      });
    });

    test('should return 404 for non-existent order', async () => {
      // Mock no changes (order not found)
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app)
        .delete('/api/orders/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Order not found'
      });
    });
  });

  describe('DELETE /api/orders (all orders)', () => {
    test('should delete all orders successfully', async () => {
      // Mock successful bulk deletion
      mockDb.run.mockImplementation((query, callback) => {
        callback.call({ changes: 5 }, null);
      });

      const response = await request(app)
        .delete('/api/orders')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'All orders deleted successfully (5 records removed)'
      });
    });
  });
});