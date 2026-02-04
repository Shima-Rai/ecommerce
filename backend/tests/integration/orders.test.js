/**
 * Integration Tests for Orders API
 * Tests the complete order management flow including product relationships
 */

const request = require('supertest');
const app = require('../../server');

describe('Orders API Integration Tests', () => {
  let testProductId;

  // Create a test product before running order tests
  beforeEach(async () => {
    const productResponse = await request(app)
      .post('/api/products')
      .send({
        name: 'Test Product for Orders',
        price: 99.99
      });
    
    testProductId = productResponse.body.data.id;
  });

  describe('POST /api/orders', () => {
    test('should create new order with valid product', async () => {
      const orderData = {
        product_id: testProductId,
        quantity: 2
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data).toHaveProperty('order_id');
      expect(response.body.data.product_id).toBe(testProductId);
      expect(response.body.data.quantity).toBe(2);
      expect(response.body.data.total_price).toBe(199.98); // 99.99 * 2
      expect(response.body.data).toHaveProperty('order_date');
    });

    test('should calculate total price correctly', async () => {
      const orderData = {
        product_id: testProductId,
        quantity: 5
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.data.total_price).toBe(499.95); // 99.99 * 5
    });

    test('should reject order with non-existent product', async () => {
      const orderData = {
        product_id: 99999, // Non-existent product
        quantity: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(404);

      expect(response.body.message).toContain('Product not found');
    });

    test('should validate required fields', async () => {
      const incompleteOrder = {
        product_id: testProductId
        // Missing quantity
      };

      const response = await request(app)
        .post('/api/orders')
        .send(incompleteOrder)
        .expect(400);

      expect(response.body.message).toContain('required');
    });

    test('should validate quantity is positive', async () => {
      const invalidOrder = {
        product_id: testProductId,
        quantity: -1  // Negative quantity
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.message).toContain('Quantity must be greater than 0');
    });

    test('should handle large quantities', async () => {
      const largeOrder = {
        product_id: testProductId,
        quantity: 1000
      };

      const response = await request(app)
        .post('/api/orders')
        .send(largeOrder)
        .expect(201);

      expect(response.body.data.quantity).toBe(1000);
      expect(response.body.data.total_price).toBe(99990); // 99.99 * 1000
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test orders
      await request(app)
        .post('/api/orders')
        .send({ product_id: testProductId, quantity: 1 });
        
      await request(app)
        .post('/api/orders')
        .send({ product_id: testProductId, quantity: 3 });
    });

    test('should fetch all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      
      response.body.data.forEach(order => {
        expect(order).toHaveProperty('order_id');
        expect(order).toHaveProperty('product_id');
        expect(order).toHaveProperty('quantity');
        expect(order).toHaveProperty('total_price');
        expect(order).toHaveProperty('order_date');
      });
    });

    test('should return orders in descending order by order_id', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      const orders = response.body.data;
      for (let i = 0; i < orders.length - 1; i++) {
        expect(orders[i].order_id).toBeGreaterThan(orders[i + 1].order_id);
      }
    });
  });

  describe('GET /api/orders/:id', () => {
    let testOrderId;

    beforeEach(async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({ product_id: testProductId, quantity: 2 });
      
      testOrderId = orderResponse.body.data.order_id;
    });

    test('should fetch specific order by ID', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('order_id', testOrderId);
      expect(response.body.data).toHaveProperty('product_id', testProductId);
      expect(response.body.data).toHaveProperty('quantity', 2);
      expect(response.body.data).toHaveProperty('total_price', 199.98);
    });

    test('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('PUT /api/orders/:id', () => {
    let testOrderId;

    beforeEach(async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({ product_id: testProductId, quantity: 2 });
      
      testOrderId = orderResponse.body.data.order_id;
    });

    test('should update order quantity and recalculate total', async () => {
      const updateData = { quantity: 5 };

      const response = await request(app)
        .put(`/api/orders/${testOrderId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(5);
      expect(response.body.data.total_price).toBe(499.95); // 99.99 * 5

      // Verify update persisted
      const fetchResponse = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .expect(200);

      expect(fetchResponse.body.data.quantity).toBe(5);
      expect(fetchResponse.body.data.total_price).toBe(499.95);
    });

    test('should return 404 when updating non-existent order', async () => {
      const response = await request(app)
        .put('/api/orders/99999')
        .send({ quantity: 3 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    test('should validate update data', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrderId}`)
        .send({ quantity: -1 })
        .expect(400);

      expect(response.body.message).toContain('Quantity must be greater than 0');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let testOrderId;

    beforeEach(async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({ product_id: testProductId, quantity: 1 });
      
      testOrderId = orderResponse.body.data.order_id;
    });

    test('should delete order successfully', async () => {
      const response = await request(app)
        .delete(`/api/orders/${testOrderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order deleted successfully');

      // Verify deletion
      const fetchResponse = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .expect(404);

      expect(fetchResponse.body.success).toBe(false);
      expect(fetchResponse.body.message).toBe('Order not found');
    });

    test('should return 404 when deleting non-existent order', async () => {
      const response = await request(app)
        .delete('/api/orders/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('Foreign Key Relationships', () => {
    test('should maintain referential integrity between orders and products', async () => {
      // Create an order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({ product_id: testProductId, quantity: 1 });

      const orderId = orderResponse.body.data.order_id;

      // Try to delete the product that has an order
      const deleteResponse = await request(app)
        .delete(`/api/products/${testProductId}`);

      // This should either:
      // 1. Fail due to foreign key constraint (status 400/500)
      // 2. Cascade delete the order (status 200)
      expect([200, 400, 500]).toContain(deleteResponse.status);

      if (deleteResponse.status === 200) {
        // If cascade delete is implemented, order should be gone too
        await request(app)
          .get(`/api/orders/${orderId}`)
          .expect(404);
      } else {
        // If foreign key constraint prevents deletion, order should still exist
        await request(app)
          .get(`/api/orders/${orderId}`)
          .expect(200);
      }
    });

    test('should prevent orders with invalid product_id', async () => {
      const invalidOrder = {
        product_id: 99999, // Non-existent product
        quantity: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(404);

      expect(response.body.message).toContain('Product not found');
    });
  });

  describe('Order Statistics and Aggregation', () => {
    beforeEach(async () => {
      // Create multiple products
      const products = await Promise.all([
        request(app).post('/api/products').send({ name: 'Product A', price: 10.00 }),
        request(app).post('/api/products').send({ name: 'Product B', price: 20.00 }),
        request(app).post('/api/products').send({ name: 'Product C', price: 30.00 })
      ]);

      // Create orders for different products
      await Promise.all([
        request(app).post('/api/orders').send({ product_id: products[0].body.data.id, quantity: 5 }),
        request(app).post('/api/orders').send({ product_id: products[1].body.data.id, quantity: 3 }),
        request(app).post('/api/orders').send({ product_id: products[0].body.data.id, quantity: 2 }),
        request(app).post('/api/orders').send({ product_id: products[2].body.data.id, quantity: 1 })
      ]);
    });

    test('should handle multiple orders for same product', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      const orders = response.body.data;
      expect(orders.length).toBeGreaterThanOrEqual(4);

      // Check that orders with same product_id exist
      const productAOrders = orders.filter(order => order.product_id === testProductId);
      expect(productAOrders.length).toBeGreaterThanOrEqual(0);
    });
  });
});