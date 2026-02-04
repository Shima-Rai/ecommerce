const express = require('express');
const router = express.Router();
const db = require('../database');

// POST - Create new order (log a sale)
router.post('/', (req, res) => {
  const { product_id, quantity } = req.body;
  
  // Validation
  if (!product_id || !quantity) {
    return res.status(400).json({ 
      success: false,
      message: 'Product ID and quantity are required' 
    });
  }

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Quantity must be greater than 0' 
    });
  }

  // First, get the product to calculate total price
  const getProductQuery = 'SELECT * FROM Products WHERE id = ?';
  
  db.get(getProductQuery, [product_id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Calculate total price
    const total_price = product.price * quantity;

    // Insert order
    const insertOrderQuery = `
      INSERT INTO Orders (product_id, quantity, total_price) 
      VALUES (?, ?, ?)
    `;
    
    db.run(insertOrderQuery, [product_id, quantity, total_price], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order_id: this.lastID,
          product_id,
          product_name: product.name,
          quantity,
          total_price: parseFloat(total_price.toFixed(2)),
          order_date: new Date().toISOString()
        }
      });
    });
  });
});

// GET all orders
router.get('/', (req, res) => {
  const query = `
    SELECT 
      o.order_id,
      o.product_id,
      p.name as product_name,
      o.quantity,
      o.total_price,
      o.order_date
    FROM Orders o
    JOIN Products p ON o.product_id = p.id
    ORDER BY o.order_id DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// GET order by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      o.order_id,
      o.product_id,
      p.name as product_name,
      p.price as unit_price,
      o.quantity,
      o.total_price,
      o.order_date
    FROM Orders o
    JOIN Products p ON o.product_id = p.id
    WHERE o.order_id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    res.json({
      success: true,
      data: row
    });
  });
});

// UPDATE order
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  // Validation
  if (!quantity) {
    return res.status(400).json({ 
      success: false,
      message: 'Quantity is required' 
    });
  }

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Quantity must be greater than 0' 
    });
  }

  // First get the order and product info to recalculate total
  const getOrderQuery = `
    SELECT o.*, p.price 
    FROM Orders o 
    JOIN Products p ON o.product_id = p.id 
    WHERE o.order_id = ?
  `;
  
  db.get(getOrderQuery, [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Calculate new total price
    const new_total_price = order.price * quantity;
    
    // Update the order
    const updateQuery = 'UPDATE Orders SET quantity = ?, total_price = ? WHERE order_id = ?';
    
    db.run(updateQuery, [quantity, new_total_price, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        success: true,
        message: 'Order updated successfully',
        data: {
          order_id: parseInt(id),
          product_id: order.product_id,
          quantity: parseInt(quantity),
          total_price: parseFloat(new_total_price.toFixed(2))
        }
      });
    });
  });
});

// DELETE order
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Orders WHERE order_id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  });
});

// DELETE all orders
router.delete('/', (req, res) => {
  const query = 'DELETE FROM Orders';
  
  db.run(query, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      success: true,
      message: `All orders deleted successfully (${this.changes} records removed)`
    });
  });
});

module.exports = router;
