/**
 * Integration Tests for Reports Flow
 * Tests complete reporting workflows including API calls and data visualization
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from '../../App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('Reports Flow Integration Tests', () => {
  const mockProducts = [
    { id: 1, name: 'Laptop', price: 75000, created_at: '2026-02-03' },
    { id: 2, name: 'Mouse', price: 2500, created_at: '2026-02-03' },
    { id: 3, name: 'Keyboard', price: 5000, created_at: '2026-02-03' }
  ];

  const mockOrders = [];

  const mockTopSellers = [
    {
      id: 1,
      name: 'Laptop',
      price: 75000,
      total_quantity_sold: 15,
      number_of_orders: 8,
      total_revenue: 1125000
    },
    {
      id: 2,
      name: 'Mouse',
      price: 2500,
      total_quantity_sold: 25,
      number_of_orders: 12,
      total_revenue: 62500
    },
    {
      id: 3,
      name: 'Keyboard',
      price: 5000,
      total_quantity_sold: 10,
      number_of_orders: 7,
      total_revenue: 50000
    }
  ];

  const mockSalesSummary = {
    total_orders: 27,
    total_items_sold: 50,
    total_revenue: 1237500,
    average_order_value: 45833.33
  };

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
      if (url.includes('/report/top-sellers')) {
        return Promise.resolve({ data: { data: mockTopSellers } });
      }
      if (url.includes('/report/sales-summary')) {
        return Promise.resolve({ data: { data: mockSalesSummary } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('Reports Tab Navigation', () => {
    test('should navigate to reports tab and load initial data', async () => {
      render(<App />);

      // Navigate to Reports tab
      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      // Check reports components are rendered
      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
        expect(screen.getByText('Top 5 Best-Selling Products')).toBeInTheDocument();
      });

      // Verify API calls were made
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/report/sales-summary');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/report/top-sellers');
    });

    test('should display loading states initially', async () => {
      // Mock delayed responses
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/top-sellers') || url.includes('/report/sales-summary')) {
          return new Promise(() => {}); // Never resolves
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      // Should show loading states
      expect(screen.getByText('Loading sales summary...')).toBeInTheDocument();
      expect(screen.getByText('Loading top sellers...')).toBeInTheDocument();
    });
  });

  describe('Sales Summary Display', () => {
    test('should display sales summary with correct data', async () => {
      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });

      // Check all summary metrics are displayed
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('27')).toBeInTheDocument();

      expect(screen.getByText('Items Sold')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('₹1237500.00')).toBeInTheDocument();

      expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
      expect(screen.getByText('₹45833.33')).toBeInTheDocument();
    });

    test('should handle sales summary refresh', async () => {
      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });

      // Click refresh button for top sellers
      const topSellersSection = screen.getByText('Top 5 Best-Selling Products').closest('.report-card');
      const refreshButton = within(topSellersSection).getByText('Refresh');
      fireEvent.click(refreshButton);

      // Should make another API call
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/report/top-sellers');
        expect(mockedAxios.get.mock.calls.length).toBeGreaterThanOrEqual(4); // Initial + refresh calls
      });
    });

    test('should handle sales summary errors', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/top-sellers')) {
          return Promise.resolve({ data: { data: mockTopSellers } });
        }
        if (url.includes('/report/sales-summary')) {
          return Promise.reject(new Error('Failed to fetch sales summary'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Mock console.error to prevent test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      // Sales summary should not render, but top sellers should
      await waitFor(() => {
        expect(screen.getByText('Top 5 Best-Selling Products')).toBeInTheDocument();
        expect(screen.queryByText('Sales Overview')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Top Sellers Display', () => {
    test('should display top sellers with correct data', async () => {
      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByText('Top 5 Best-Selling Products')).toBeInTheDocument();
      });

      // Check top sellers data
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();

      // Check quantities sold
      expect(screen.getByText('15')).toBeInTheDocument(); // Laptop quantity
      expect(screen.getByText('25')).toBeInTheDocument(); // Mouse quantity
      expect(screen.getByText('10')).toBeInTheDocument(); // Keyboard quantity

      // Check revenues
      expect(screen.getByText('₹1125000.00')).toBeInTheDocument(); // Laptop revenue
      expect(screen.getByText('₹62500.00')).toBeInTheDocument(); // Mouse revenue
      expect(screen.getByText('₹50000.00')).toBeInTheDocument(); // Keyboard revenue
    });

    test('should handle empty top sellers data', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/top-sellers')) {
          return Promise.resolve({ data: { data: [] } });
        }
        if (url.includes('/report/sales-summary')) {
          return Promise.resolve({ data: { data: mockSalesSummary } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByText('No sales data available yet. Place some orders to see top sellers!')).toBeInTheDocument();
      });
    });

    test('should handle top sellers API errors', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/top-sellers')) {
          return Promise.reject(new Error('Failed to fetch top sellers'));
        }
        if (url.includes('/report/sales-summary')) {
          return Promise.resolve({ data: { data: mockSalesSummary } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Failed to load top sellers report')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Reports Data Integration', () => {
    test('should show consistent data across reports and other tabs', async () => {
      render(<App />);

      // Start on Products tab - check product count
      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument();
        expect(screen.getByText('Keyboard')).toBeInTheDocument();
      });

      // Navigate to Reports
      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      // Check that top sellers include products that exist
      await waitFor(() => {
        const topSellersSection = screen.getByText('Top 5 Best-Selling Products').closest('div');
        expect(topSellersSection).toBeInTheDocument();
      });

      // All products from products tab should appear in top sellers
      await waitFor(() => {
        expect(screen.getAllByText('Laptop')).toHaveLength(1);
        expect(screen.getAllByText('Mouse')).toHaveLength(1);
        expect(screen.getAllByText('Keyboard')).toHaveLength(1);
      });
    });

    test('should update reports when switching between tabs', async () => {
      let reportsCallCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/top-sellers') || url.includes('/report/sales-summary')) {
          reportsCallCount++;
          if (url.includes('/report/top-sellers')) {
            return Promise.resolve({ data: { data: mockTopSellers } });
          } else {
            return Promise.resolve({ data: { data: mockSalesSummary } });
          }
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      // Go to Reports tab
      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });

      const initialCallCount = reportsCallCount;

      // Switch to another tab and back
      const productsTab = screen.getByText('Products');
      fireEvent.click(productsTab);
      fireEvent.click(reportsTab);

      // Reports should reload
      await waitFor(() => {
        expect(reportsCallCount).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe('Real-time Data Updates', () => {
    test('should reflect new orders in reports', async () => {
      // Simulate scenario where reports change after new order is placed
      let summaryCallCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/top-sellers')) {
          return Promise.resolve({ data: { data: mockTopSellers } });
        }
        if (url.includes('/report/sales-summary')) {
          summaryCallCount++;
          if (summaryCallCount === 1) {
            return Promise.resolve({ data: { data: mockSalesSummary } });
          } else {
            // Return updated summary with higher numbers
            return Promise.resolve({ 
              data: { 
                data: {
                  ...mockSalesSummary,
                  total_orders: 28,
                  total_revenue: 1312500
                }
              }
            });
          }
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      // Go to Reports tab
      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByText('27')).toBeInTheDocument(); // Initial order count
      });

      // Navigate to Orders tab and back to Reports
      const ordersTab = screen.getByRole('button', { name: 'Orders' });
      fireEvent.click(ordersTab);
      fireEvent.click(reportsTab);

      // Should show updated numbers
      await waitFor(() => {
        expect(screen.getByText('28')).toBeInTheDocument(); // Updated order count
        expect(screen.getByText('₹1312500.00')).toBeInTheDocument(); // Updated revenue
      });
    });
  });

  describe('Error Recovery', () => {
    test('should recover from network errors on retry', async () => {
      let callCount = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/sales-summary')) {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(new Error('Network error'));
          } else {
            return Promise.resolve({ data: { data: mockSalesSummary } });
          }
        }
        if (url.includes('/report/top-sellers')) {
          return Promise.resolve({ data: { data: mockTopSellers } });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      // Initially should fail to load sales summary
      await waitFor(() => {
        expect(screen.getByText('Top 5 Best-Selling Products')).toBeInTheDocument();
        expect(screen.queryByText('Sales Overview')).not.toBeInTheDocument();
      });

      // Navigate away and back to retry
      const productsTab = screen.getByText('Products');
      fireEvent.click(productsTab);
      fireEvent.click(reportsTab);

      // Should now load successfully
      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
        expect(screen.getByText('27')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Loading', () => {
    test('should handle concurrent report API calls', async () => {
      let topSellersResolved = false;
      let summaryResolved = false;

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/products')) {
          return Promise.resolve({ data: { data: mockProducts } });
        }
        if (url.includes('/orders')) {
          return Promise.resolve({ data: { data: mockOrders } });
        }
        if (url.includes('/report/top-sellers')) {
          return new Promise((resolve) => {
            setTimeout(() => {
              topSellersResolved = true;
              resolve({ data: { data: mockTopSellers } });
            }, 100);
          });
        }
        if (url.includes('/report/sales-summary')) {
          return new Promise((resolve) => {
            setTimeout(() => {
              summaryResolved = true;
              resolve({ data: { data: mockSalesSummary } });
            }, 150);
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<App />);

      const reportsTab = screen.getByText('Reports');
      fireEvent.click(reportsTab);

      // Both loading states should appear
      expect(screen.getByText('Loading top sellers...')).toBeInTheDocument();
      expect(screen.getByText('Loading sales summary...')).toBeInTheDocument();

      // Wait for both to resolve
      await waitFor(() => {
        expect(screen.getByText('Top 5 Best-Selling Products')).toBeInTheDocument();
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });

      expect(topSellersResolved).toBe(true);
      expect(summaryResolved).toBe(true);
    });
  });
});