/**
 * Unit Tests for ProductList Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductList from '../../components/ProductList';

describe('ProductList Component', () => {
  const mockProducts = [
    { id: 1, name: 'Test Product 1', price: 99.99 },
    { id: 2, name: 'Test Product 2', price: 149.50 },
    { id: 3, name: 'Test Product 3', price: 75.00 }
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render empty state when no products', () => {
      render(<ProductList products={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const emptyMessage = screen.getByText('No products available. Add your first product above!');
      expect(emptyMessage).toBeInTheDocument();
      expect(emptyMessage.closest('div')).toHaveClass('empty-state');
    });

    test('should render product list when products exist', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Test Product 3')).toBeInTheDocument();
    });

    test('should display product prices with rupee symbol', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('₹99.99')).toBeInTheDocument();
      expect(screen.getByText('₹149.50')).toBeInTheDocument();
      expect(screen.getByText('₹75.00')).toBeInTheDocument();
    });

    test('should display product IDs', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('ID: 1')).toBeInTheDocument();
      expect(screen.getByText('ID: 2')).toBeInTheDocument();
      expect(screen.getByText('ID: 3')).toBeInTheDocument();
    });

    test('should render edit and delete buttons for each product', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });

    test('should apply correct CSS classes', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const productGrid = screen.getByText('Test Product 1').closest('.product-grid');
      expect(productGrid).toBeInTheDocument();
      
      const editButton = screen.getAllByText('Edit')[0];
      expect(editButton).toHaveClass('btn', 'btn-edit');
      
      const deleteButton = screen.getAllByText('Delete')[0];
      expect(deleteButton).toHaveClass('btn', 'btn-delete');
    });
  });

  describe('Interactions', () => {
    test('should call onEdit when edit button is clicked', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockProducts[0]);
    });

    test('should call onDelete when delete button is clicked', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[1]);
      
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockProducts[1].id);
    });

    test('should handle multiple clicks correctly', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      fireEvent.click(editButtons[0]);
      fireEvent.click(deleteButtons[2]);
      fireEvent.click(editButtons[1]);
      
      expect(mockOnEdit).toHaveBeenCalledTimes(2);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenNthCalledWith(1, mockProducts[0]);
      expect(mockOnEdit).toHaveBeenNthCalledWith(2, mockProducts[1]);
      expect(mockOnDelete).toHaveBeenCalledWith(mockProducts[2].id);
    });

    test('should call onEdit with correct product data', () => {
      render(<ProductList products={mockProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[2]);
      
      expect(mockOnEdit).toHaveBeenCalledWith({
        id: 3,
        name: 'Test Product 3',
        price: 75.00
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle products with zero price', () => {
      const zeroPrice = [{ id: 1, name: 'Free Product', price: 0 }];
      render(<ProductList products={zeroPrice} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('₹0.00')).toBeInTheDocument();
    });

    test('should handle products with very long names', () => {
      const longName = [{ id: 1, name: 'Very Long Product Name That Might Cause Layout Issues In The UI', price: 99.99 }];
      render(<ProductList products={longName} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Very Long Product Name That Might Cause Layout Issues In The UI')).toBeInTheDocument();
    });

    test('should handle products with decimal prices correctly', () => {
      const decimalPrice = [{ id: 1, name: 'Decimal Product', price: 99.999 }];
      render(<ProductList products={decimalPrice} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('₹100.00')).toBeInTheDocument(); // Should round to 2 decimal places
    });

    test('should handle single product correctly', () => {
      const singleProduct = [{ id: 1, name: 'Single Product', price: 50.00 }];
      render(<ProductList products={singleProduct} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Single Product')).toBeInTheDocument();
      expect(screen.getAllByText('Edit')).toHaveLength(1);
      expect(screen.getAllByText('Delete')).toHaveLength(1);
    });

    test('should handle undefined callbacks gracefully', () => {
      expect(() => {
        render(<ProductList products={mockProducts} onEdit={undefined} onDelete={undefined} />);
      }).not.toThrow();
    });

    test('should handle products with special characters in names', () => {
      const specialChars = [{ id: 1, name: 'Product with "quotes" & symbols!', price: 100 }];
      render(<ProductList products={specialChars} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Product with "quotes" & symbols!')).toBeInTheDocument();
    });

    test('should handle large numbers of products', () => {
      const manyProducts = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: (i + 1) * 10
      }));
      
      render(<ProductList products={manyProducts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 50')).toBeInTheDocument();
      expect(screen.getAllByText('Edit')).toHaveLength(50);
    });
  });
});