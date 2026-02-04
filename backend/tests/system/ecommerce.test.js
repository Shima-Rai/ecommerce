/**
 * System Tests for E-Commerce Application
 * Tests complete business workflows and end-to-end scenarios
 */

const request = require('supertest');
const app = require('../../server');

describe('E-Commerce System Tests', () => {
  describe('Complete Product Management Workflow', () => {
    test('should handle full product lifecycle', async () => {
      // 1. Create a new product
      const productData = {
        name: 'System Test Laptop',
        price: 1299.99
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.data.id;
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.name).toBe(productData.name);

      // 2. Fetch the created product
      const fetchResponse = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(fetchResponse.body.data.id).toBe(productId);
      expect(fetchResponse.body.data.name).toBe(productData.name);

      // 3. Update the product
      const updateData = {
        name: 'Updated System Test Laptop',
        price: 1199.99
      };

      const updateResponse = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updateData.name);
      expect(updateResponse.body.data.price).toBe(updateData.price);

      // 4. Verify update persisted
      const verifyResponse = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(verifyResponse.body.data.name).toBe(updateData.name);
      expect(verifyResponse.body.data.price).toBe(updateData.price);

      // 5. List all products and verify our product is included
      const listResponse = await request(app)
        .get('/api/products')
        .expect(200);

      const ourProduct = listResponse.body.data.find(p => p.id === productId);
      expect(ourProduct).toBeDefined();
      expect(ourProduct.name).toBe(updateData.name);

      // 6. Delete the product
      const deleteResponse = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // 7. Verify deletion
      await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });
  });

  describe('Complete Order Management Workflow', () => {
    test('should handle full order lifecycle', async () => {
      // 1. Create a product for order tests
      const productResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'System Test Product',
          price: 99.99
        })
        .expect(201);
      
      const productId = productResponse.body.data.id;

      // 2. Create an order
      const orderData = {
        product_id: productId,
        quantity: 3
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.data.order_id;
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.total_price).toBe(299.97); // 99.99 * 3

      // 3. Fetch the created order
      const fetchResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(fetchResponse.body.data.order_id).toBe(orderId);
      expect(fetchResponse.body.data.quantity).toBe(3);

      // 3. Update the order quantity
      const updateResponse = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.quantity).toBe(5);
      expect(updateResponse.body.data.total_price).toBe(499.95); // 99.99 * 5

      // 4. Verify update persisted
      const verifyResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(verifyResponse.body.data.quantity).toBe(5);
      expect(verifyResponse.body.data.total_price).toBe(499.95);

      // 5. List all orders and verify our order is included
      const listResponse = await request(app)
        .get('/api/orders')
        .expect(200);

      const ourOrder = listResponse.body.data.find(o => o.order_id === orderId);
      expect(ourOrder).toBeDefined();
      expect(ourOrder.quantity).toBe(5);

      // 6. Delete the order
      const deleteResponse = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // 7. Verify deletion
      await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(404);
    });
  });

  describe('Sales Reporting System Workflow', () => {
    test('should generate top sellers report correctly', async () => {
      // Setup test data for reporting
      const products = await Promise.all([
        request(app).post('/api/products').send({ name: 'Report Test Product A', price: 100.00 }).expect(201),
        request(app).post('/api/products').send({ name: 'Report Test Product B', price: 200.00 }).expect(201),
        request(app).post('/api/products').send({ name: 'Report Test Product C', price: 300.00 }).expect(201)
      ]);

      // Create orders with different quantities to test top sellers  
      await Promise.all([
        request(app).post('/api/orders').send({ product_id: products[0].body.data.id, quantity: 10 }).expect(201), // 1000.00
        request(app).post('/api/orders').send({ product_id: products[1].body.data.id, quantity: 5 }).expect(201),  // 1000.00
        request(app).post('/api/orders').send({ product_id: products[2].body.data.id, quantity: 2 }).expect(201),  // 600.00
        request(app).post('/api/orders').send({ product_id: products[0].body.data.id, quantity: 3 }).expect(201),  // 300.00 (total 1300.00)
        request(app).post('/api/orders').send({ product_id: products[1].body.data.id, quantity: 2 }).expect(201)   // 400.00 (total 1400.00)
      ]);

      const response = await request(app)
        .get('/api/report/top-sellers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check report structure
      response.body.data.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('total_quantity_sold');
        expect(item).toHaveProperty('total_revenue');
        expect(item.total_quantity_sold).toBeGreaterThan(0);
        expect(item.total_revenue).toBeGreaterThan(0);
      });

      // Verify data is sorted by total_quantity_sold in descending order
      for (let i = 0; i < response.body.data.length - 1; i++) {
        expect(response.body.data[i].total_quantity_sold)
          .toBeGreaterThanOrEqual(response.body.data[i + 1].total_quantity_sold);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle concurrent requests gracefully', async () => {
      // Create multiple products concurrently
      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/products')
          .send({
            name: `Concurrent Product ${i}`,
            price: Math.random() * 100 + 10
          })
      );

      const responses = await Promise.all(concurrentRequests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // All products should have unique IDs
      const productIds = responses.map(r => r.body.data.id);
      const uniqueIds = new Set(productIds);
      expect(uniqueIds.size).toBe(productIds.length);
    });

    test('should maintain data consistency during high load', async () => {
      // Create a product
      const productResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Load Test Product', price: 50.00 });

      const productId = productResponse.body.data.id;

      // Create multiple orders concurrently for the same product
      const orderRequests = Array.from({ length: 20 }, (_, i) =>
        request(app)
          .post('/api/orders')
          .send({
            product_id: productId,
            quantity: i + 1
          })
      );

      const orderResponses = await Promise.all(orderRequests);

      // All orders should succeed
      orderResponses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all orders were created
      const ordersResponse = await request(app)
        .get('/api/orders')
        .expect(200);

      const testProductOrders = ordersResponse.body.data.filter(
        order => order.product_id === productId
      );

      expect(testProductOrders.length).toBe(20);

      // Verify total calculations are correct
      testProductOrders.forEach((order, index) => {
        const expectedQuantity = index + 1; // We created orders with quantity 1, 2, 3, ..., 20
        const expectedTotal = 50.00 * expectedQuantity;
        
        // Find the order with this quantity
        const matchingOrder = testProductOrders.find(o => o.quantity === expectedQuantity);
        expect(matchingOrder).toBeDefined();
        expect(matchingOrder.total_price).toBeCloseTo(expectedTotal, 2);
      });
    });

    test('should handle invalid data gracefully', async () => {
      // Test various invalid inputs
      const invalidRequests = [
        // Invalid product creation
        { method: 'post', url: '/api/products', data: { name: '', price: 10 } },
        { method: 'post', url: '/api/products', data: { name: 'Test', price: -5 } },
        { method: 'post', url: '/api/products', data: { name: 'Test' } },
        
        // Invalid order creation
        { method: 'post', url: '/api/orders', data: { product_id: 999999, quantity: 1 } },
        { method: 'post', url: '/api/orders', data: { product_id: 1, quantity: -1 } },
        { method: 'post', url: '/api/orders', data: { product_id: 1 } },
        
        // Invalid updates
        { method: 'put', url: '/api/products/999999', data: { name: 'Test', price: 10 } },
        { method: 'put', url: '/api/orders/999999', data: { quantity: 5 } }
      ];

      for (const req of invalidRequests) {
        const response = await request(app)[req.method](req.url).send(req.data);
        expect([400, 404, 500]).toContain(response.status);
        // Check for error response structure (success: false or error property)
        expect(response.body.success === false || response.body.error).toBeDefined();
      }
    });
  });

  describe('API Performance and Scalability', () => {
    test('should handle large datasets efficiently', async () => {
      // Create 100 products
      const productPromises = Array.from({ length: 100 }, (_, i) =>
        request(app)
          .post('/api/products')
          .send({
            name: `Bulk Product ${i}`,
            price: Math.random() * 1000 + 10
          })
      );

      const startTime = Date.now();
      await Promise.all(productPromises);
      const creationTime = Date.now() - startTime;

      // Fetch all products
      const fetchStart = Date.now();
      const response = await request(app)
        .get('/api/products')
        .expect(200);
      const fetchTime = Date.now() - fetchStart;

      // Performance assertions (adjust thresholds as needed)
      expect(creationTime).toBeLessThan(10000); // 10 seconds for 100 products
      expect(fetchTime).toBeLessThan(2000);     // 2 seconds to fetch products
      expect(response.body.data.length).toBeGreaterThanOrEqual(100);

      console.log(`Created 100 products in ${creationTime}ms`);
      console.log(`Fetched ${response.body.data.length} products in ${fetchTime}ms`);
    });

    test('should maintain response times under load', async () => {
      const responseTimesMs = [];
      const numberOfRequests = 50;

      // Make multiple concurrent requests
      const requests = Array.from({ length: numberOfRequests }, async () => {
        const start = Date.now();
        const response = await request(app).get('/api/products');
        const responseTime = Date.now() - start;
        responseTimesMs.push(responseTime);
        return response;
      });

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Calculate performance metrics
      const avgResponseTime = responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length;
      const maxResponseTime = Math.max(...responseTimesMs);
      const minResponseTime = Math.min(...responseTimesMs);

      console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`Max response time: ${maxResponseTime}ms`);
      console.log(`Min response time: ${minResponseTime}ms`);

      // Performance assertions (adjust thresholds based on requirements)
      expect(avgResponseTime).toBeLessThan(500);  // 500ms average
      expect(maxResponseTime).toBeLessThan(2000); // 2s maximum
    });
  });

  describe('Application Health and Monitoring', () => {
    test('should provide application health status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('E-Commerce API Server');
      expect(response.body.version).toBeDefined();
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints).toHaveProperty('products');
      expect(response.body.endpoints).toHaveProperty('orders');
      expect(response.body.endpoints).toHaveProperty('reports');
    });

    test('should handle errors gracefully with proper status codes', async () => {
      // Test various error scenarios
      const errorTests = [
        { url: '/api/products/abc', expectedStatus: 404 },
        { url: '/api/orders/xyz', expectedStatus: 404 },
        { url: '/api/nonexistent', expectedStatus: 404 }
      ];

      for (const test of errorTests) {
        const response = await request(app).get(test.url);
        expect([test.expectedStatus, 404, 500]).toContain(response.status);
      }
    });
  });
});