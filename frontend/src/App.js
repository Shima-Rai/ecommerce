import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import EditOrderForm from './components/EditOrderForm';
import TopSellers from './components/TopSellers';
import SalesSummary from './components/SalesSummary';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch orders');
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // Show message
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Handle product create/update
  const handleProductSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, productData);
        showMessage('success', 'Product updated successfully');
      } else {
        await axios.post(`${API_URL}/products`, productData);
        showMessage('success', 'Product created successfully');
      }
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      showMessage('error', 'Failed to save product');
      console.error('Error saving product:', error);
    }
  };

  // Handle product delete
  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      showMessage('success', 'Product deleted successfully');
      fetchProducts();
    } catch (error) {
      showMessage('error', 'Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  // Handle order submit
  const handleOrderSubmit = async (orderData) => {
    try {
      await axios.post(`${API_URL}/orders`, orderData);
      showMessage('success', 'Order placed successfully');
      fetchOrders();
    } catch (error) {
      showMessage('error', 'Failed to place order');
      console.error('Error placing order:', error);
    }
  };

  // Handle order edit
  const handleOrderEdit = async (orderData) => {
    try {
      await axios.put(`${API_URL}/orders/${editingOrder.order_id}`, orderData);
      showMessage('success', 'Order updated successfully');
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      showMessage('error', 'Failed to update order');
      console.error('Error updating order:', error);
    }
  };

  // Handle order delete
  const handleOrderDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/orders/${orderId}`);
      showMessage('success', 'Order deleted successfully');
      fetchOrders();
    } catch (error) {
      showMessage('error', 'Failed to delete order');
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>E-Commerce & Reporting Platform</h1>
        <p>Product Catalog & Sales Analytics</p>
      </header>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <nav className="tabs">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </nav>

      <main className="content">
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>Product Management</h2>
            </div>
            
            <ProductForm
              product={editingProduct}
              onSubmit={handleProductSubmit}
              onCancel={() => setEditingProduct(null)}
            />

            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <ProductList
                products={products}
                onEdit={setEditingProduct}
                onDelete={handleProductDelete}
              />
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h2>Order Management</h2>
            </div>
            
            <div className="order-management">
              <div className="order-form-section">
                <h3>Place New Order</h3>
                <OrderForm products={products} onSubmit={handleOrderSubmit} />
              </div>
              
              <OrderList 
                orders={orders}
                onEdit={setEditingOrder}
                onDelete={handleOrderDelete}
              />
            </div>

            {editingOrder && (
              <EditOrderForm
                order={editingOrder}
                onSubmit={handleOrderEdit}
                onCancel={() => setEditingOrder(null)}
              />
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="section-header">
              <h2>Sales Reports & Analytics</h2>
            </div>
            <SalesSummary />
            <TopSellers />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
