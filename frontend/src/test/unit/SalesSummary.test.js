/**
 * Unit Tests for SalesSummary Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import SalesSummary from '../../components/SalesSummary';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('SalesSummary Component', () => {
  const mockSummaryData = {
    total_orders: 25,
    total_items_sold: 150,
    total_revenue: 12500.75,
    average_order_value: 500.03
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.error mock if it exists
    if (console.error.mockRestore) {
      console.error.mockRestore();
    }
  });

  describe('Loading State', () => {
    test('should show loading state initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<SalesSummary />);
      
      expect(screen.getByText('Loading sales summary...')).toBeInTheDocument();
      expect(screen.getByText('Loading sales summary...')).toHaveClass('loading');
    });

    test('should show loading state when refresh is clicked', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockSummaryData } })
        .mockImplementation(() => new Promise(() => {})); // Second call never resolves
      
      render(<SalesSummary />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });
      
      // Click refresh
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      expect(screen.getByText('Loading sales summary...')).toBeInTheDocument();
    });
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: { data: mockSummaryData } });
    });

    test('should render sales summary with correct data', async () => {
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });

      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      
      expect(screen.getByText('Items Sold')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('₹12500.75')).toBeInTheDocument();
      
      expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
      expect(screen.getByText('₹500.03')).toBeInTheDocument();
    });

    test('should render refresh button', async () => {
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });
      
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toHaveClass('btn', 'btn-small');
    });

    test('should apply correct CSS classes to summary cards', async () => {
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument();
      });

      const revenueCard = screen.getByText('Total Revenue').closest('.summary-card');
      expect(revenueCard).toHaveClass('summary-card', 'highlight');
      
      const ordersCard = screen.getByText('Total Orders').closest('.summary-card');
      expect(ordersCard).toHaveClass('summary-card');
      expect(ordersCard).not.toHaveClass('highlight');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      console.error = jest.fn(); // Mock console.error
    });

    test('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error fetching sales summary:', expect.any(Error));
      });
      
      // Component should render nothing when there's an error and no data
      expect(screen.queryByText('Sales Overview')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading sales summary...')).not.toBeInTheDocument();
    });

    test('should handle 404 errors', async () => {
      mockedAxios.get.mockRejectedValue({ 
        response: { 
          status: 404, 
          data: { message: 'Not found' } 
        } 
      });
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });

    test('should handle server errors (500)', async () => {
      mockedAxios.get.mockRejectedValue({ 
        response: { 
          status: 500, 
          data: { error: 'Internal server error' } 
        } 
      });
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('Refresh Functionality', () => {
    test('should call API again when refresh button is clicked', async () => {
      mockedAxios.get.mockResolvedValue({ data: { data: mockSummaryData } });
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });
    });

    test('should update data when refresh returns new data', async () => {
      const updatedData = {
        total_orders: 30,
        total_items_sold: 200,
        total_revenue: 15000.00,
        average_order_value: 500.00
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockSummaryData } })
        .mockResolvedValueOnce({ data: { data: updatedData } });
      
      render(<SalesSummary />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument();
      });

      // Click refresh
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      // Wait for updated data
      await waitFor(() => {
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
        expect(screen.getByText('₹15000.00')).toBeInTheDocument();
      });
    });
  });

  describe('API Configuration', () => {
    test('should use correct API endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { data: mockSummaryData } });
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/report/sales-summary');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero values correctly', async () => {
      const zeroData = {
        total_orders: 0,
        total_items_sold: 0,
        total_revenue: 0,
        average_order_value: 0
      };
      
      mockedAxios.get.mockResolvedValue({ data: { data: zeroData } });
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        const zeroTexts = screen.getAllByText('0');
        expect(zeroTexts.length).toBeGreaterThanOrEqual(2); // At least 2 zero values
        
        const zeroAmounts = screen.getAllByText('₹0.00');
        expect(zeroAmounts.length).toBeGreaterThanOrEqual(2); // Revenue and avg order value
      });
    });

    test('should handle large numbers correctly', async () => {
      const largeData = {
        total_orders: 999999,
        total_items_sold: 1000000,
        total_revenue: 99999999.99,
        average_order_value: 10000.50
      };
      
      mockedAxios.get.mockResolvedValue({ data: { data: largeData } });
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        expect(screen.getByText('999999')).toBeInTheDocument();
        expect(screen.getByText('1000000')).toBeInTheDocument();
        expect(screen.getByText('₹99999999.99')).toBeInTheDocument();
        expect(screen.getByText('₹10000.50')).toBeInTheDocument();
      });
    });

    test('should handle decimal precision in revenue display', async () => {
      const precisionData = {
        total_orders: 1,
        total_items_sold: 1,
        total_revenue: 99.999,
        average_order_value: 99.999
      };
      
      mockedAxios.get.mockResolvedValue({ data: { data: precisionData } });
      
      render(<SalesSummary />);
      
      await waitFor(() => {
        // Should display exactly 2 decimal places - check for at least one occurrence
        const precisionAmounts = screen.getAllByText('₹100.00');
        expect(precisionAmounts.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});