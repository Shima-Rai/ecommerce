const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/report/top-sellers - Get top 5 best-selling products
router.get('/top-sellers', (req, res) => {
  // Complex SQL query with aggregation to get top sellers
  const query = `
    SELECT 
      p.id,
      p.name,
      p.price,
      SUM(o.quantity) as total_quantity_sold,
      COUNT(o.order_id) as number_of_orders,
      SUM(o.total_price) as total_revenue
    FROM Products p
    LEFT JOIN Orders o ON p.id = o.product_id
    GROUP BY p.id, p.name, p.price
    HAVING total_quantity_sold > 0
    ORDER BY total_quantity_sold DESC
    LIMIT 5
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      message: 'Top 5 best-selling products retrieved successfully',
      data: rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price.toFixed(2)),
        total_quantity_sold: row.total_quantity_sold,
        number_of_orders: row.number_of_orders,
        total_revenue: parseFloat(row.total_revenue.toFixed(2))
      })),
      count: rows.length
    });
  });
});

// GET /api/report/sales-summary - Additional report for overall sales
router.get('/sales-summary', (req, res) => {
  const query = `
    SELECT 
      COUNT(DISTINCT order_id) as total_orders,
      SUM(quantity) as total_items_sold,
      SUM(total_price) as total_revenue,
      AVG(total_price) as average_order_value,
      MIN(order_date) as first_order_date,
      MAX(order_date) as last_order_date
    FROM Orders
  `;
  
  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      message: 'Sales summary retrieved successfully',
      data: {
        total_orders: row.total_orders || 0,
        total_items_sold: row.total_items_sold || 0,
        total_revenue: row.total_revenue ? parseFloat(row.total_revenue.toFixed(2)) : 0,
        average_order_value: row.average_order_value ? parseFloat(row.average_order_value.toFixed(2)) : 0,
        first_order_date: row.first_order_date,
        last_order_date: row.last_order_date
      }
    });
  });
});

// GET /api/report/product-performance - Performance metrics by product
router.get('/product-performance', (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.price,
      COALESCE(SUM(o.quantity), 0) as total_sold,
      COALESCE(COUNT(o.order_id), 0) as order_count,
      COALESCE(SUM(o.total_price), 0) as revenue
    FROM Products p
    LEFT JOIN Orders o ON p.id = o.product_id
    GROUP BY p.id, p.name, p.price
    ORDER BY total_sold DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      message: 'Product performance data retrieved successfully',
      data: rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price.toFixed(2)),
        total_sold: row.total_sold,
        order_count: row.order_count,
        revenue: parseFloat(row.revenue.toFixed(2))
      })),
      count: rows.length
    });
  });
});

module.exports = router;
