/**
 * Integration Tests for Order Flow
 * Tests complete order management workflows including API calls
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from '../../App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('Order Flow Integration Tests', () => {
  const mockProducts = [
    { id: 1, name: 'Laptop', price: 75000, created_at: '2026-02-03' },
    { id: 2, name: 'Mouse', price: 2500, created_at: '2026-02-03' },
    { id: 3, name: 'Keyboard', price: 5000, created_at: '2026-02-03' }
  ];

  const mockOrders = [
    { 
      order_id: 1, 
      product_id: 1, 
      product_name: 'Laptop', 
      quantity: 2, 
      total_price: 150000, 
      order_date: '2026-02-03T10:00:00Z' 
    },
    { 
      order_id: 2, 
      product_id: 2, 
      product_name: 'Mouse', 
      quantity: 5, 
      total_price: 12500, 
      order_date: '2026-02-03T11:00:00Z' 
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default API mocks
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/products')) {
        return Promise.resolve({ data: { data: mockProducts } });
      }
      if (url.includes('/orders')) {
        return Promise.resolve({ data: { data: mockOrders } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        data: { order_id: 3, product_id: 1, quantity: 1, total_price: 75000 }
      }
    });

    mockedAxios.put.mockResolvedValue({
      data: { success: true, message: 'Order updated successfully' }
    });

    mockedAxios.delete.mockResolvedValue({
      data: { success: true, message: 'Order deleted successfully' }
    });
  });

  describe('Order Creation Flow', () => {
    test('should complete full order creation workflow', async () => {
      render(<App />);

      // Navigate to Orders tab
      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });

      // Fill order form
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');

      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '2' } });

      // Submit order
      const placeOrderBtn = screen.getByText('Place Order');
      fireEvent.click(placeOrderBtn);

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/orders',
          { product_id: 1, quantity: 2 }
        );
      });

      // Verify success message appears
      await waitFor(() => {
        expect(screen.getByText('Order placed successfully')).toBeInTheDocument();
      });
    });

    test('should show order summary before submission', async () => {
      render(<App />);

      // Navigate to Orders tab
      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });

      // Select product and quantity
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');

      fireEvent.change(productSelect, { target: { value: '2' } });
      fireEvent.change(quantityInput, { target: { value: '3' } });

      // Check order summary appears
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      
      // Verify the summary shows the selected product
      const orderSummary = screen.getByText('Order Summary').closest('form');
      const summaryText = within(orderSummary).getByText('Mouse');
      expect(summaryText).toBeInTheDocument();
    });

    test('should handle order creation errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });

      // Fill and submit form
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');

      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '1' } });

      const placeOrderBtn = screen.getByText('Place Order');
      fireEvent.click(placeOrderBtn);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to place order')).toBeInTheDocument();
      });
    });
  });

  describe('Order Management Flow', () => {
    test('should display existing orders on load', async () => {
      render(<App />);

      // Navigate to Orders tab
      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      // Check orders are displayed
      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument();
        expect(screen.getByText('₹150000.00')).toBeInTheDocument();
        expect(screen.getByText('₹12500.00')).toBeInTheDocument();
      });
    });

    test('should complete order edit workflow', async () => {
      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
      });

      // Click edit button for first order (using role to find the button)
      const editButtons = screen.getAllByRole('button', { name: /✏️ Edit/ });
      fireEvent.click(editButtons[0]);

      // Check edit form appears
      await waitFor(() => {
        expect(screen.getByText(/Edit Order #/)).toBeInTheDocument();
      });

      // Modify quantity
      const quantityInput = screen.getByDisplayValue('2');
      fireEvent.change(quantityInput, { target: { value: '3' } });

      // Save changes
      const saveBtn = screen.getByText('Update Order');
      fireEvent.click(saveBtn);

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          'http://localhost:5000/api/orders/1',
          { quantity: 3 }
        );
      });
    });

    test('should complete order deletion workflow', async () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
      });

      // Click delete button (using role to find the button)
      const deleteButtons = screen.getAllByRole('button', { name: /🗑️ Delete/ });
      fireEvent.click(deleteButtons[0]);

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5000/api/orders/1');
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Order-Product Integration', () => {
    test('should only show available products in order form', async () => {
      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });

      // Check product dropdown contains all products
      const productSelect = screen.getByLabelText('Select Product');
      
      expect(screen.getByText('Laptop - ₹75000.00')).toBeInTheDocument();
      expect(screen.getByText('Mouse - ₹2500.00')).toBeInTheDocument();
      expect(screen.getByText('Keyboard - ₹5000.00')).toBeInTheDocument();
    });

    test('should update order summary when product selection changes', async () => {
      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });

      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');

      // Select first product
      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '2' } });

      // Verify summary using more specific selector (in the form, not in history table)
      const orderForm = productSelect.closest('form');
      const summaryTotal = within(orderForm).getByText((content, element) => {
        return element.textContent === '₹150000.00' && element.closest('.summary-row');
      });
      expect(summaryTotal).toBeInTheDocument();

      // Change to second product
      fireEvent.change(productSelect, { target: { value: '2' } });

      // Verify new total
      const newSummaryTotal = within(orderForm).getByText((content, element) => {
        return element.textContent === '₹5000.00' && element.closest('.summary-row');
      });
      expect(newSummaryTotal).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    test('should refresh order list after successful creation', async () => {
      // Mock fresh orders data after creation
      let callCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: { data: mockOrders } });
          } else {
            // Return updated orders with new order
            return Promise.resolve({ 
              data: { 
                data: [...mockOrders, {
                  order_id: 3, 
                  product_id: 1, 
                  product_name: 'Laptop', 
                  quantity: 1, 
                  total_price: 75000, 
                  order_date: '2026-02-03T12:00:00Z' 
                }]
              }
            });
          }
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
      });

      // Place new order
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');

      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '1' } });

      const placeOrderBtn = screen.getByText('Place Order');
      fireEvent.click(placeOrderBtn);

      // Verify orders list is refreshed and new order appears
      await waitFor(() => {
        expect(screen.getByText('#3')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle network failures gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch orders')).toBeInTheDocument();
      });
    });

    test('should handle invalid order data', async () => {
      render(<App />);

      const ordersTab = screen.getByText('Orders');
      fireEvent.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText('Order History')).toBeInTheDocument();
      });

      // Try to submit without selecting product
      const placeOrderBtn = screen.getByText('Place Order');
      fireEvent.click(placeOrderBtn);

      // Should show validation alert (mocked in OrderForm tests)
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});