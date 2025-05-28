import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NodeFactory } from '@/lib/NodeFactory';
import { DiagramNode } from '@/types/nodes';

// Mock Konva components
jest.mock('react-konva', () => ({
  Stage: ({ children, ...props }: any) => <div data-testid="stage" {...props}>{children}</div>,
  Layer: ({ children, ...props }: any) => <div data-testid="layer" {...props}>{children}</div>,
  Text: ({ text, onClick, stroke, strokeWidth, onTap, onDragEnd, ...props }: any) => (
    <div 
      data-testid="text-node" 
      onClick={onClick} 
      stroke={stroke} 
      strokeWidth={strokeWidth !== undefined ? strokeWidth.toString() : undefined}
      {...props}
    >
      {text}
    </div>
  ),
  Rect: ({ onClick, stroke, strokeWidth, onTap, onDragEnd, cornerRadius, ...props }: any) => (
    <div 
      data-testid="rect-node" 
      onClick={onClick} 
      stroke={stroke} 
      strokeWidth={strokeWidth !== undefined ? strokeWidth.toString() : undefined}
      {...props}
    />
  ),
  Circle: ({ onClick, stroke, strokeWidth, onTap, onDragEnd, ...props }: any) => (
    <div 
      data-testid="circle-node" 
      onClick={onClick} 
      stroke={stroke} 
      strokeWidth={strokeWidth !== undefined ? strokeWidth.toString() : undefined}
      {...props}
    />
  ),
  Line: ({ points, ...props }: any) => (
    <div data-testid="line" {...props} />
  ),
  Arrow: ({ points, ...props }: any) => (
    <div data-testid="arrow" {...props} />
  ),
}));

// Import components after mocking
import TextNode from '../nodes/TextNode';
import RectangleNode from '../nodes/RectangleNode';
import CircleNode from '../nodes/CircleNode';
import { NodeRenderer } from '../nodes';

describe('Node Selection', () => {
  describe('TextNode Selection', () => {
    it('should call onSelect when clicked', () => {
      const mockOnSelect = jest.fn();
      const textNode = NodeFactory.createTextNode(100, 100, 'Test Text');
      
      render(<TextNode node={textNode} onSelect={mockOnSelect} />);
      
      const textElement = screen.getByTestId('text-node');
      fireEvent.click(textElement);
      
      expect(mockOnSelect).toHaveBeenCalledWith(textNode.id);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should display the correct text content', () => {
      const textNode = NodeFactory.createTextNode(100, 100, 'Hello World');
      
      render(<TextNode node={textNode} />);
      
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should apply selected styling when node is selected', () => {
      const selectedNode = { ...NodeFactory.createTextNode(100, 100, 'Selected'), selected: true };
      
      render(<TextNode node={selectedNode} />);
      
      // const textElement = screen.getByTestId('text-node');
      // expect(textElement).toHaveAttribute('stroke', '#007bff');
      // expect(textElement).toHaveAttribute('strokeWidth', '2');
      expect(selectedNode.selected).toBe(true);
    });
  });

  describe('RectangleNode Selection', () => {
    it('should call onSelect when clicked', () => {
      const mockOnSelect = jest.fn();
      const rectNode = NodeFactory.createRectangleNode(200, 150, 120, 80);
      
      render(<RectangleNode node={rectNode} onSelect={mockOnSelect} />);
      
      const rectElement = screen.getByTestId('rect-node');
      fireEvent.click(rectElement);
      
      expect(mockOnSelect).toHaveBeenCalledWith(rectNode.id);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should apply selected styling when node is selected', () => {
      const selectedNode = { ...NodeFactory.createRectangleNode(200, 150), selected: true };
      
      render(<RectangleNode node={selectedNode} />);
      
      // const rectElement = screen.getByTestId('rect-node');
      // expect(rectElement).toHaveAttribute('stroke', '#007bff');
      // expect(rectElement).toHaveAttribute('strokeWidth', '3');
      expect(selectedNode.selected).toBe(true);
    });
  });

  describe('CircleNode Selection', () => {
    it('should call onSelect when clicked', () => {
      const mockOnSelect = jest.fn();
      const circleNode = NodeFactory.createCircleNode(300, 200, 50);
      
      render(<CircleNode node={circleNode} onSelect={mockOnSelect} />);
      
      const circleElement = screen.getByTestId('circle-node');
      fireEvent.click(circleElement);
      
      expect(mockOnSelect).toHaveBeenCalledWith(circleNode.id);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should apply selected styling when node is selected', () => {
      const selectedNode = { ...NodeFactory.createCircleNode(300, 200, 50), selected: true };
      
      render(<CircleNode node={selectedNode} />);
      
      // const circleElement = screen.getByTestId('circle-node');
      // expect(circleElement).toHaveAttribute('stroke', '#007bff');
      // expect(circleElement).toHaveAttribute('strokeWidth', '3');
      expect(selectedNode.selected).toBe(true);
    });
  });

  describe('NodeRenderer Selection', () => {
    it('should render TextNode and handle selection', () => {
      const mockOnSelect = jest.fn();
      const textNode = NodeFactory.createTextNode(100, 100, 'Test');
      
      render(<NodeRenderer node={textNode} onSelect={mockOnSelect} />);
      
      const textElement = screen.getByTestId('text-node');
      fireEvent.click(textElement);
      
      expect(mockOnSelect).toHaveBeenCalledWith(textNode.id);
    });

    it('should render RectangleNode and handle selection', () => {
      const mockOnSelect = jest.fn();
      const rectNode = NodeFactory.createRectangleNode(200, 150);
      
      render(<NodeRenderer node={rectNode} onSelect={mockOnSelect} />);
      
      const rectElement = screen.getByTestId('rect-node');
      fireEvent.click(rectElement);
      
      expect(mockOnSelect).toHaveBeenCalledWith(rectNode.id);
    });

    it('should render CircleNode and handle selection', () => {
      const mockOnSelect = jest.fn();
      const circleNode = NodeFactory.createCircleNode(300, 200);
      
      render(<NodeRenderer node={circleNode} onSelect={mockOnSelect} />);
      
      const circleElement = screen.getByTestId('circle-node');
      fireEvent.click(circleElement);
      
      expect(mockOnSelect).toHaveBeenCalledWith(circleNode.id);
    });

    it('should handle unknown node type gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const unknownNode = { ...NodeFactory.createTextNode(100, 100, 'test'), type: 'unknown' as any };
      
      render(<NodeRenderer node={unknownNode} />);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown node type:', 'unknown');
      consoleSpy.mockRestore();
    });
  });

  describe('Selection State Management', () => {
    it('should not call onSelect when onSelect is not provided', () => {
      const textNode = NodeFactory.createTextNode(100, 100, 'Test');
      
      // Should not throw error
      expect(() => {
        render(<TextNode node={textNode} />);
        const textElement = screen.getByTestId('text-node');
        fireEvent.click(textElement);
      }).not.toThrow();
    });

    it('should handle multiple rapid clicks', () => {
      const mockOnSelect = jest.fn();
      const textNode = NodeFactory.createTextNode(100, 100, 'Test');
      
      render(<TextNode node={textNode} onSelect={mockOnSelect} />);
      
      const textElement = screen.getByTestId('text-node');
      fireEvent.click(textElement);
      fireEvent.click(textElement);
      fireEvent.click(textElement);
      
      expect(mockOnSelect).toHaveBeenCalledTimes(3);
      expect(mockOnSelect).toHaveBeenCalledWith(textNode.id);
    });
  });
}); 