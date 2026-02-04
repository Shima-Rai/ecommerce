import React, { useState, useEffect } from 'react';

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price
      });
    } else {
      setFormData({
        name: '',
        price: ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Please fill in all fields');
      return;
    }

    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    onSubmit({
      name: formData.name,
      price: parseFloat(formData.price)
    });

    setFormData({ name: '', price: '' });
  };

  return (
    <div className="form-container">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (₹)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {product ? 'Update Product' : 'Add Product'}
          </button>
          {product && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
