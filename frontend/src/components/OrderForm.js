import React, { useState } from 'react';

function OrderForm({ products, onSubmit }) {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.quantity) {
      alert('Please select a product and enter quantity');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    onSubmit({
      product_id: parseInt(formData.product_id),
      quantity: parseInt(formData.quantity)
    });

    setFormData({ product_id: '', quantity: 1 });
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));
  const totalPrice = selectedProduct ? selectedProduct.price * formData.quantity : 0;

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label htmlFor="product_id">Select Product</label>
          <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose a product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ₹{parseFloat(product.price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        {selectedProduct && (
          <div className="order-summary">
            <h4>Order Summary</h4>
            <div className="summary-row">
              <span>Product:</span>
              <strong>{selectedProduct.name}</strong>
            </div>
            <div className="summary-row">
              <span>Unit Price:</span>
              <strong>₹{parseFloat(selectedProduct.price).toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>Quantity:</span>
              <strong>{formData.quantity}</strong>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;
