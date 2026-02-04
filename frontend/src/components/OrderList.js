import React from 'react';

const OrderList = ({ orders, onEdit, onDelete }) => {
  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <p>No orders found. Create your first order above!</p>
      </div>
    );
  }

  return (
    <div className="order-list">
      <h3>Order History</h3>
      <div className="orders-table">
        <div className="table-header">
          <span>Order ID</span>
          <span>Product</span>
          <span>Quantity</span>
          <span>Total Price</span>
          <span>Order Date</span>
          <span>Actions</span>
        </div>
        
        {orders.map(order => (
          <div key={order.order_id} className="table-row">
            <span className="order-id">#{order.order_id}</span>
            <span className="product-name">{order.product_name}</span>
            <span className="quantity">{order.quantity}</span>
            <span className="total-price">₹{order.total_price?.toFixed(2)}</span>
            <span className="order-date">
              {new Date(order.order_date).toLocaleDateString()}
            </span>
            <div className="actions">
              <button 
                className="edit-btn"
                onClick={() => onEdit(order)}
                title="Edit order"
              >
                ✏️ Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => onDelete(order.order_id)}
                title="Delete order"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;