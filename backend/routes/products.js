const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all products
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Products ORDER BY id DESC';
  
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

// GET product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Products WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    res.json({
      success: true,
      data: row
    });
  });
});

// CREATE new product
router.post('/', (req, res) => {
  const { name, price } = req.body;
  
  // Validation
  if (!name || !price) {
    return res.status(400).json({ 
      success: false,
      message: 'Name and price are required' 
    });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Price must be a positive number' 
    });
  }

  const query = 'INSERT INTO Products (name, price) VALUES (?, ?)';
  
  db.run(query, [name, parseFloat(price)], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: this.lastID,
        name,
        price: parseFloat(price)
      }
    });
  });
});

// UPDATE product
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  
  // Validation
  if (!name || !price) {
    return res.status(400).json({ 
      success: false,
      message: 'Name and price are required' 
    });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Price must be a positive number' 
    });
  }

  const query = 'UPDATE Products SET name = ?, price = ? WHERE id = ?';
  
  db.run(query, [name, parseFloat(price), id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id: parseInt(id),
        name,
        price: parseFloat(price)
      }
    });
  });
});

// DELETE product
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Products WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });
});

module.exports = router;
