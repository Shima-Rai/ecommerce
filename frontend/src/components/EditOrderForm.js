import React, { useState, useEffect } from 'react';

const EditOrderForm = ({ order, onSubmit, onCancel }) => {
  const [quantity, setQuantity] = useState(order?.quantity || 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setQuantity(order.quantity);
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ quantity: parseInt(quantity) });
      setQuantity(1);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="edit-order-overlay">
      <div className="edit-order-form">
        <div className="form-header">
          <h3>Edit Order #{order.order_id}</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="order-details">
          <p><strong>Product:</strong> {order.product_name}</p>
          <p><strong>Unit Price:</strong> ₹{order.unit_price?.toFixed(2) || (order.total_price / order.quantity).toFixed(2)}</p>
          <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>New Total Price:</label>
            <div className="calculated-total">
              ₹{((order.unit_price || (order.total_price / order.quantity)) * quantity).toFixed(2)}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderForm;