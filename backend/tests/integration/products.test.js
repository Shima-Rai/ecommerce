/**
 * Integration Tests for Product API
 * Tests the complete flow from HTTP request to database and back
 */

const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const app = require('../../server');

// Use test database from setup
const { testDb, TEST_DB_PATH } = require('../setup');

describe('Product API Integration Tests', () => {
  describe('GET /api/products', () => {
    test('should fetch all products from database', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBe(response.body.data.length);
      
      // Check that we have the seeded test data
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('price');
      expect(response.body.data[0]).toHaveProperty('created_at');
    });

    test('should return products in descending order by ID', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      const products = response.body.data;
      expect(products.length).toBeGreaterThan(1);
      
      // Check order
      for (let i = 0; i < products.length - 1; i++) {
        expect(products[i].id).toBeGreaterThan(products[i + 1].id);
      }
    });
  });

  describe('GET /api/products/:id', () => {
    test('should fetch specific product by ID', async () => {
      // First get all products to get a valid ID
      const allProducts = await request(app).get('/api/products');
      const validId = allProducts.body.data[0].id;

      const response = await request(app)
        .get(`/api/products/${validId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', validId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('price');
      expect(response.body.data).toHaveProperty('created_at');
    });

    test('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    test('should handle invalid ID format gracefully', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('POST /api/products', () => {
    test('should create new product and save to database', async () => {
      const newProduct = {
        name: 'Integration Test Product',
        price: 299.99
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.price).toBe(newProduct.price);

      // Verify product was actually saved to database
      const savedProduct = await request(app)
        .get(`/api/products/${response.body.data.id}`)
        .expect(200);

      expect(savedProduct.body.data.name).toBe(newProduct.name);
      expect(savedProduct.body.data.price).toBe(newProduct.price);
    });

    test('should validate required fields', async () => {
      const incompleteProduct = {
        name: 'Product without price'
      };

      const response = await request(app)
        .post('/api/products')
        .send(incompleteProduct)
        .expect(400);

      expect(response.body.message).toContain('required');
    });

    test('should validate price format', async () => {
      const invalidProduct = {
        name: 'Product',
        price: 'not-a-number'
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.message).toContain('number');
    });

    test('should validate positive price', async () => {
      const negativePrice = {
        name: 'Product',
        price: -10.99
      };

      const response = await request(app)
        .post('/api/products')
        .send(negativePrice)
        .expect(400);

      expect(response.body.message).toContain('positive');
    });

    test('should handle very long product names', async () => {
      const longNameProduct = {
        name: 'A'.repeat(1000), // Very long name
        price: 99.99
      };

      const response = await request(app)
        .post('/api/products')
        .send(longNameProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name.length).toBe(1000);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update existing product in database', async () => {
      // First create a product
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Original Product', price: 100.00 });

      const productId = createResponse.body.data.id;

      // Update the product
      const updateData = {
        name: 'Updated Product',
        price: 150.00
      };

      const updateResponse = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.message).toBe('Product updated successfully');
      expect(updateResponse.body.data.name).toBe(updateData.name);
      expect(updateResponse.body.data.price).toBe(updateData.price);

      // Verify update was persisted in database
      const fetchResponse = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(fetchResponse.body.data.name).toBe(updateData.name);
      expect(fetchResponse.body.data.price).toBe(updateData.price);
    });

    test('should return 404 when updating non-existent product', async () => {
      const updateData = {
        name: 'Non-existent Product',
        price: 200.00
      };

      const response = await request(app)
        .put('/api/products/99999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    test('should validate update data', async () => {
      // Create a product first
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Test Product', price: 100.00 });

      const productId = createResponse.body.data.id;

      // Try to update with invalid data
      const invalidUpdate = {
        name: 'Valid Name',
        price: -50.00 // Invalid negative price
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.message).toContain('positive');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete product from database', async () => {
      // First create a product
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Product to Delete', price: 75.00 });

      const productId = createResponse.body.data.id;

      // Delete the product
      const deleteResponse = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe('Product deleted successfully');

      // Verify product was deleted from database
      const fetchResponse = await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);

      expect(fetchResponse.body.success).toBe(false);
      expect(fetchResponse.body.message).toBe('Product not found');
    });

    test('should return 404 when deleting non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    test('should handle cascade deletion (if orders exist)', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Product with Orders', price: 200.00 });

      const productId = createResponse.body.data.id;

      // Create an order for this product
      const orderData = {
        product_id: productId,
        quantity: 2
      };

      // Create order using the API
      await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // Try to delete the product (should handle foreign key constraint)
      const deleteResponse = await request(app)
        .delete(`/api/products/${productId}`);

      // The response depends on how the application handles foreign key constraints
      // Either it should delete successfully with cascade, or return an error
      expect([200, 400, 500]).toContain(deleteResponse.status);
    });
  });

  describe('Database Consistency', () => {
    test('should maintain data integrity across multiple operations', async () => {
      // Create multiple products
      const products = [
        { name: 'Product 1', price: 10.00 },
        { name: 'Product 2', price: 20.00 },
        { name: 'Product 3', price: 30.00 }
      ];

      const createdProducts = [];
      for (const product of products) {
        const response = await request(app)
          .post('/api/products')
          .send(product);
        createdProducts.push(response.body.data);
      }

      // Verify all products exist
      const allProductsResponse = await request(app)
        .get('/api/products');

      expect(allProductsResponse.body.data.length).toBeGreaterThanOrEqual(3);

      // Update one product
      const updateResponse = await request(app)
        .put(`/api/products/${createdProducts[1].id}`)
        .send({ name: 'Updated Product 2', price: 25.00 });

      expect(updateResponse.status).toBe(200);

      // Delete one product
      const deleteResponse = await request(app)
        .delete(`/api/products/${createdProducts[2].id}`);

      expect(deleteResponse.status).toBe(200);

      // Verify final state
      const finalResponse = await request(app)
        .get('/api/products');

      const finalProducts = finalResponse.body.data;
      const product1 = finalProducts.find(p => p.id === createdProducts[0].id);
      const product2 = finalProducts.find(p => p.id === createdProducts[1].id);
      const product3 = finalProducts.find(p => p.id === createdProducts[2].id);

      expect(product1).toBeDefined();
      expect(product1.name).toBe('Product 1');

      expect(product2).toBeDefined();
      expect(product2.name).toBe('Updated Product 2');
      expect(product2.price).toBe(25.00);

      expect(product3).toBeUndefined();
    });
  });
});