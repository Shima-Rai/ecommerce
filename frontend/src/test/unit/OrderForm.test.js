/**
 * Unit Tests for OrderForm Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderForm from '../../components/OrderForm';

describe('OrderForm Component', () => {
  const mockProducts = [
    { id: 1, name: 'Product A', price: 100.00 },
    { id: 2, name: 'Product B', price: 250.50 },
    { id: 3, name: 'Product C', price: 75.99 }
  ];

  const mockOnSubmit = jest.fn();

  // Mock window.alert
  beforeAll(() => {
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render order form with all elements', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByLabelText('Select Product')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    test('should render product options in dropdown', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText('-- Choose a product --')).toBeInTheDocument();
      expect(screen.getByText('Product A - ₹100.00')).toBeInTheDocument();
      expect(screen.getByText('Product B - ₹250.50')).toBeInTheDocument();
      expect(screen.getByText('Product C - ₹75.99')).toBeInTheDocument();
    });

    test('should have default quantity of 1', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const quantityInput = screen.getByLabelText('Quantity');
      expect(quantityInput.value).toBe('1');
    });
  });

  describe('Form Interactions', () => {
    test('should update product selection', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      fireEvent.change(productSelect, { target: { value: '2' } });
      
      expect(productSelect.value).toBe('2');
    });

    test('should update quantity value', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const quantityInput = screen.getByLabelText('Quantity');
      fireEvent.change(quantityInput, { target: { value: '5' } });
      
      expect(quantityInput.value).toBe('5');
    });

    test('should show order summary when product is selected', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      fireEvent.change(productSelect, { target: { value: '1' } });
      
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('Product A')).toBeInTheDocument();
      
      // Check for unit price and total separately using more specific queries
      const summaryRows = screen.getAllByText('₹100.00');
      expect(summaryRows).toHaveLength(2); // Unit price and Total price
    });

    test('should calculate total price correctly', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');
      
      fireEvent.change(productSelect, { target: { value: '2' } });
      fireEvent.change(quantityInput, { target: { value: '3' } });
      
      expect(screen.getByText('₹751.50')).toBeInTheDocument(); // 250.50 * 3
    });
  });

  describe('Form Validation', () => {
    test('should show alert when no product is selected', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByText('Place Order');
      fireEvent.click(submitButton);
      
      expect(window.alert).toHaveBeenCalledWith('Please select a product and enter quantity');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should show alert when quantity is 0', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');
      const submitButton = screen.getByText('Place Order');
      
      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '0' } });
      fireEvent.click(submitButton);
      
      expect(window.alert).toHaveBeenCalledWith('Quantity must be greater than 0');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should show alert when quantity is negative', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');
      const submitButton = screen.getByText('Place Order');
      
      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '-5' } });
      fireEvent.click(submitButton);
      
      expect(window.alert).toHaveBeenCalledWith('Quantity must be greater than 0');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    test('should submit with correct data when valid', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');
      const submitButton = screen.getByText('Place Order');
      
      fireEvent.change(productSelect, { target: { value: '2' } });
      fireEvent.change(quantityInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        product_id: 2,
        quantity: 4
      });
    });

    test('should reset form after successful submission', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');
      const submitButton = screen.getByText('Place Order');
      
      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '3' } });
      fireEvent.click(submitButton);
      
      expect(productSelect.value).toBe('');
      expect(quantityInput.value).toBe('1');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty products array', () => {
      render(<OrderForm products={[]} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText('-- Choose a product --')).toBeInTheDocument();
      expect(screen.queryByText('Order Summary')).not.toBeInTheDocument();
    });

    test('should handle string quantity values correctly', () => {
      render(<OrderForm products={mockProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      const quantityInput = screen.getByLabelText('Quantity');
      const submitButton = screen.getByText('Place Order');
      
      fireEvent.change(productSelect, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '2' } });
      fireEvent.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        product_id: 1,
        quantity: 2
      });
    });

    test('should handle products with decimal prices', () => {
      const decimalProducts = [{ id: 1, name: 'Decimal Product', price: 99.99 }];
      render(<OrderForm products={decimalProducts} onSubmit={mockOnSubmit} />);
      
      const productSelect = screen.getByLabelText('Select Product');
      fireEvent.change(productSelect, { target: { value: '1' } });
      
      expect(screen.getByText('Decimal Product - ₹99.99')).toBeInTheDocument();
    });
  });
});