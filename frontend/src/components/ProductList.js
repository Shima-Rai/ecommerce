import React from 'react';

function ProductList({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products available. Add your first product above!</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <div className="product-info">
            <h3>{product.name}</h3>
            <p className="product-price">₹{parseFloat(product.price).toFixed(2)}</p>
            <p className="product-id">ID: {product.id}</p>
          </div>
          <div className="product-actions">
            <button 
              className="btn btn-edit"
              onClick={() => onEdit(product)}
            >
              Edit
            </button>
            <button 
              className="btn btn-delete"
              onClick={() => onDelete(product.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
