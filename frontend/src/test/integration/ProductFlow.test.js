/**
 * Integration Tests for Product Flow
 * Tests complete product management workflows including API calls
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from '../../App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('Product Flow Integration Tests', () => {
  const mockProducts = [
    { id: 1, name: 'Laptop', price: 75000, created_at: '2026-02-03' },
    { id: 2, name: 'Mouse', price: 2500, created_at: '2026-02-03' }
  ];

  const mockOrders = [];

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
        data: { id: 3, name: 'Keyboard', price: 5000 }
      }
    });

    mockedAxios.put.mockResolvedValue({
      data: {
        success: true,
        data: { id: 1, name: 'Updated Laptop', price: 80000 }
      }
    });

    mockedAxios.delete.mockResolvedValue({
      data: { success: true, message: 'Product deleted successfully' }
    });
  });

  describe('Product Display Flow', () => {
    test('should load and display products on app start', async () => {
      render(<App />);

      // Should start on Products tab by default
      expect(screen.getByText('Products')).toBeInTheDocument();

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument();
        expect(screen.getByText('₹75000.00')).toBeInTheDocument();
        expect(screen.getByText('₹2500.00')).toBeInTheDocument();
      });

      // Verify API was called
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/products');
    });

    test('should show empty state when no products exist', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: [] } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: [] } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('No products available. Add your first product above!')).toBeInTheDocument();
      });
    });

    test('should handle product loading errors', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: [] } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch products')).toBeInTheDocument();
      });
    });
  });

  describe('Product Creation Flow', () => {
    test('should complete full product creation workflow', async () => {
      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Fill product form
      const nameInput = screen.getByLabelText('Product Name');
      const priceInput = screen.getByLabelText('Price (₹)');

      fireEvent.change(nameInput, { target: { value: 'New Keyboard' } });
      fireEvent.change(priceInput, { target: { value: '5000' } });

      // Submit form
      const addButton = screen.getByText('Add Product');
      fireEvent.click(addButton);

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/products',
          { name: 'New Keyboard', price: 5000 }
        );
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Product created successfully')).toBeInTheDocument();
      });

      // Verify form is reset
      expect(nameInput.value).toBe('');
      expect(priceInput.value).toBe('');
    });

    test('should validate required fields before submission', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Try to submit empty form
      const addButton = screen.getByText('Add Product');
      fireEvent.click(addButton);

      // Should not call API
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should handle product creation errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Validation error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Fill and submit form
      const nameInput = screen.getByLabelText('Product Name');
      const priceInput = screen.getByLabelText('Price (₹)');

      fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      fireEvent.change(priceInput, { target: { value: '1000' } });

      const addButton = screen.getByText('Add Product');
      fireEvent.click(addButton);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to save product')).toBeInTheDocument();
      });
    });
  });

  describe('Product Edit Flow', () => {
    test('should complete full product edit workflow', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Click edit button for first product
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Check form is populated with existing data
      const nameInput = screen.getByDisplayValue('Laptop');
      const priceInput = screen.getByDisplayValue('75000');

      expect(nameInput).toBeInTheDocument();
      expect(priceInput).toBeInTheDocument();

      // Modify values
      fireEvent.change(nameInput, { target: { value: 'Updated Laptop' } });
      fireEvent.change(priceInput, { target: { value: '80000' } });

      // Submit update
      const updateButton = screen.getByText('Update Product');
      fireEvent.click(updateButton);

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          'http://localhost:5000/api/products/1',
          { name: 'Updated Laptop', price: 80000 }
        );
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Product updated successfully')).toBeInTheDocument();
      });
    });

    test('should cancel edit and return to add mode', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Start editing
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Update Product')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();

      // Cancel editing
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Should return to add mode
      expect(screen.getByText('Add Product')).toBeInTheDocument();
      expect(screen.queryByText('Update Product')).not.toBeInTheDocument();
    });

    test('should handle edit errors gracefully', async () => {
      mockedAxios.put.mockRejectedValue(new Error('Update failed'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Edit product
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByDisplayValue('Laptop');
      fireEvent.change(nameInput, { target: { value: 'Failed Update' } });

      const updateButton = screen.getByText('Update Product');
      fireEvent.click(updateButton);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to save product')).toBeInTheDocument();
      });
    });
  });

  describe('Product Deletion Flow', () => {
    test('should complete product deletion workflow', async () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5000/api/products/1');
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Product deleted successfully')).toBeInTheDocument();
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    test('should handle deletion errors', async () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      mockedAxios.delete.mockRejectedValue(new Error('Cannot delete'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete product')).toBeInTheDocument();
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Real-time Updates', () => {
    test('should refresh product list after successful creation', async () => {
      let callCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: { data: mockProducts } });
          } else {
            // Return updated products with new product
            return Promise.resolve({ 
              data: { 
                data: [...mockProducts, { id: 3, name: 'New Keyboard', price: 5000 }]
              }
            });
          }
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: [] } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Add new product
      const nameInput = screen.getByLabelText('Product Name');
      const priceInput = screen.getByLabelText('Price (₹)');

      fireEvent.change(nameInput, { target: { value: 'New Keyboard' } });
      fireEvent.change(priceInput, { target: { value: '5000' } });

      const addButton = screen.getByText('Add Product');
      fireEvent.click(addButton);

      // Verify new product appears in list
      await waitFor(() => {
        expect(screen.getByText('New Keyboard')).toBeInTheDocument();
      });
    });

    test('should refresh product list after successful update', async () => {
      let callCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: { data: mockProducts } });
          } else {
            // Return updated products
            return Promise.resolve({ 
              data: { 
                data: [
                  { id: 1, name: 'Updated Laptop', price: 80000, created_at: '2026-02-03' },
                  mockProducts[1]
                ]
              }
            });
          }
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: [] } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Edit product
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByDisplayValue('Laptop');
      fireEvent.change(nameInput, { target: { value: 'Updated Laptop' } });

      const updateButton = screen.getByText('Update Product');
      fireEvent.click(updateButton);

      // Verify updated product name appears
      await waitFor(() => {
        expect(screen.getByText('Updated Laptop')).toBeInTheDocument();
      });
    });

    test('should refresh product list after successful deletion', async () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      let callCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: { data: mockProducts } });
          } else {
            // Return products with one deleted
            return Promise.resolve({ 
              data: { 
                data: [mockProducts[1]] // Only second product remains
              }
            });
          }
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: [] } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument();
      });

      // Delete first product
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Verify product is removed from list
      await waitFor(() => {
        expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument(); // Second product still exists
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Form Validation Flow', () => {
    test('should validate price format during input', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Product Name');
      const priceInput = screen.getByLabelText('Price (₹)');

      // Try invalid data
      fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      fireEvent.change(priceInput, { target: { value: '-100' } });

      const addButton = screen.getByText('Add Product');
      fireEvent.click(addButton);

      // Should not make API call with invalid price
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should handle very long product names', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Product Name');
      const priceInput = screen.getByLabelText('Price (₹)');

      const longName = 'A'.repeat(100);
      fireEvent.change(nameInput, { target: { value: longName } });
      fireEvent.change(priceInput, { target: { value: '1000' } });

      const addButton = screen.getByText('Add Product');
      fireEvent.click(addButton);

      // Should still make API call
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/products',
          { name: longName, price: 1000 }
        );
      });
    });
  });
});