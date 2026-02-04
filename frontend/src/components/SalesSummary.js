import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SalesSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/report/sales-summary`);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching sales summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="loading">Loading sales summary...</div>;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Sales Overview</h3>
        <button className="btn btn-small" onClick={fetchSummary}>
          Refresh
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-content">
            <h4>Total Orders</h4>
            <p className="summary-value">{summary.total_orders}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <h4>Items Sold</h4>
            <p className="summary-value">{summary.total_items_sold}</p>
          </div>
        </div>

        <div className="summary-card highlight">
          <div className="summary-content">
            <h4>Total Revenue</h4>
            <p className="summary-value">₹{summary.total_revenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <h4>Avg Order Value</h4>
            <p className="summary-value">₹{summary.average_order_value.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesSummary;
