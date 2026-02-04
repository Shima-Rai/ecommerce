import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function TopSellers() {
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTopSellers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/report/top-sellers`);
      setTopSellers(response.data.data);
    } catch (error) {
      setError('Failed to load top sellers report');
      console.error('Error fetching top sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellers();
  }, []);

  if (loading) {
    return <div className="loading">Loading top sellers...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchTopSellers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Top 5 Best-Selling Products</h3>
        <button className="btn btn-small" onClick={fetchTopSellers}>
          Refresh
        </button>
      </div>

      {topSellers.length === 0 ? (
        <div className="empty-state">
          <p>No sales data available yet. Place some orders to see top sellers!</p>
        </div>
      ) : (
        <div className="top-sellers-list">
          {topSellers.map((product, index) => (
            <div key={product.id} className="top-seller-item">
              <div className="rank">
                <span className={`rank-badge rank-${index + 1}`}>
                  {index + 1}
                </span>
              </div>
              <div className="product-details">
                <h4>{product.name}</h4>
                <p className="product-price">₹{product.price.toFixed(2)} per unit</p>
              </div>
              <div className="product-stats">
                <div className="stat">
                  <span className="stat-label">Quantity Sold</span>
                  <span className="stat-value">{product.total_quantity_sold}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Orders</span>
                  <span className="stat-value">{product.number_of_orders}</span>
                </div>
                <div className="stat highlight">
                  <span className="stat-label">Revenue</span>
                  <span className="stat-value">₹{product.total_revenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopSellers;
