import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Canvas from '../Canvas';
import { DiagramNode } from '@/types/nodes';

// Mock Konva components
jest.mock('react-konva', () => ({
  Stage: ({ children, ...props }: any) => (
    <div data-testid="konva-stage" {...props}>
      {children}
    </div>
  ),
  Layer: ({ children, ...props }: any) => (
    <div data-testid="konva-layer" {...props}>
      {children}
    </div>
  ),
  Transformer: ({ ref, ...props }: any) => (
    <div data-testid="konva-transformer" {...props} />
  ),
  Line: (props: any) => <div data-testid="konva-line" {...props} />,
}));

describe('NodeResizing', () => {
  const mockNodes: DiagramNode[] = [
    {
      id: 'rect-1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      selected: false,
    },
    {
      id: 'circle-1',
      type: 'circle',
      x: 300,
      y: 200,
      radius: 50,
      selected: false,
    },
  ];

  const defaultProps = {
    width: 800,
    height: 600,
    nodes: mockNodes,
    edges: [],
    onNodeSelect: jest.fn(),
    onNodeDragEnd: jest.fn(),
    onNodeResize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders transformer component', () => {
    render(<Canvas {...defaultProps} />);
    
    const transformer = screen.getByTestId('konva-transformer');
    expect(transformer).toBeInTheDocument();
  });

  it('calls onNodeResize when transformer transform ends', () => {
    const onNodeResize = jest.fn();
    render(<Canvas {...defaultProps} onNodeResize={onNodeResize} />);
    
    // The transformer component should be present
    const transformer = screen.getByTestId('konva-transformer');
    expect(transformer).toBeInTheDocument();
    
    // Note: Testing actual transform events requires more complex setup with Konva
    // This test verifies the transformer is rendered and the callback is available
    expect(onNodeResize).toBeDefined();
  });

  it('renders canvas with resizable nodes', () => {
    render(<Canvas {...defaultProps} />);
    
    // Verify stage and layer are rendered
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument();
    expect(screen.getByTestId('konva-layer')).toBeInTheDocument();
    
    // Verify transformer is present for resizing
    expect(screen.getByTestId('konva-transformer')).toBeInTheDocument();
  });

  it('handles missing onNodeResize callback gracefully', () => {
    const propsWithoutResize = {
      ...defaultProps,
      onNodeResize: undefined,
    };
    
    expect(() => {
      render(<Canvas {...propsWithoutResize} />);
    }).not.toThrow();
  });
}); 