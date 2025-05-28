import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagramEditor from '@/app/page';

// Mock Konva components for integration testing
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
  Text: ({ children, text, id, ...props }: any) => (
    <div 
      data-testid={`konva-text-${id}`}
      {...props}
      onDoubleClick={props.onDblClick}
    >
      {text || children}
    </div>
  ),
  Rect: ({ id, ...props }: any) => (
    <div data-testid={`konva-rect-${id}`} {...props} />
  ),
  Circle: ({ id, ...props }: any) => (
    <div data-testid={`konva-circle-${id}`} {...props} />
  ),
  Line: ({ points, ...props }: any) => (
    <div 
      data-testid="konva-line-edge" 
      data-points={JSON.stringify(points)}
      {...props} 
    />
  ),
  Transformer: ({ ref, ...props }: any) => (
    <div data-testid="konva-transformer" {...props} />
  ),
}));

describe('Text Editing Integration', () => {
  beforeEach(() => {
    // Clear any existing textareas
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.remove();
    });
  });

  afterEach(() => {
    // Clean up any remaining textareas
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.remove();
    });
  });

  it('renders the diagram editor with text editing capabilities', async () => {
    render(<DiagramEditor />);
    
    // Verify the main components are rendered
    expect(screen.getByText('Add Text Node')).toBeInTheDocument();
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument();
    expect(screen.getByTestId('konva-layer')).toBeInTheDocument();
  });

  it('can add text nodes to the canvas', async () => {
    render(<DiagramEditor />);
    
    // Clear canvas first to ensure clean state
    const clearButton = screen.getByText('Clear Canvas');
    fireEvent.click(clearButton);
    
    // Add a text node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    // Find the text node (should be the only one after clearing)
    const textNode = screen.getByTestId(/^konva-text-/);
    expect(textNode).toBeInTheDocument();
    expect(textNode).toHaveTextContent('New Text');
  });

  it('can add multiple text nodes independently', async () => {
    render(<DiagramEditor />);
    
    // Clear canvas first
    const clearButton = screen.getByText('Clear Canvas');
    fireEvent.click(clearButton);
    
    // Add two text nodes
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);

    // Should have two text nodes
    const textNodes = screen.getAllByTestId(/^konva-text-/);
    expect(textNodes).toHaveLength(2);
    
    // Both should have the default text
    textNodes.forEach(node => {
      expect(node).toHaveTextContent('New Text');
    });
  });

  it('provides text editing interface elements', async () => {
    render(<DiagramEditor />);
    
    // Verify that the interface supports text editing
    expect(screen.getByText('Add Text Node')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    expect(screen.getByText('Clear Canvas')).toBeInTheDocument();
  });

  it('handles canvas clearing correctly', async () => {
    render(<DiagramEditor />);
    
    // Add some text nodes
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);
    
    // Verify nodes exist
    let textNodes = screen.getAllByTestId(/^konva-text-/);
    expect(textNodes.length).toBeGreaterThan(0);
    
    // Clear canvas
    const clearButton = screen.getByText('Clear Canvas');
    fireEvent.click(clearButton);
    
    // After clearing, only grid lines should remain (no text nodes)
    await waitFor(() => {
      const remainingTextNodes = screen.queryAllByTestId(/^konva-text-/);
      expect(remainingTextNodes).toHaveLength(0);
    });
  });

  it('supports node selection interface', async () => {
    render(<DiagramEditor />);
    
    // Add a text node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);
    
    const textNode = screen.getAllByTestId(/^konva-text-/)[0];
    
    // Click on the text node (selection)
    fireEvent.click(textNode);
    
    // The delete button should become enabled when something is selected
    // (This tests the selection mechanism indirectly)
    const deleteButton = screen.getByText('Delete Selected');
    expect(deleteButton).toBeInTheDocument();
  });

  it('maintains proper component structure for text editing', async () => {
    render(<DiagramEditor />);
    
    // Clear and add a text node
    const clearButton = screen.getByText('Clear Canvas');
    fireEvent.click(clearButton);
    
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);
    
    const textNode = screen.getByTestId(/^konva-text-/);
    
    // Verify the text node has the double-click handler
    expect(textNode).toHaveAttribute('onDoubleClick');
    
    // Verify it's properly positioned within the canvas structure
    const stage = screen.getByTestId('konva-stage');
    const layer = screen.getByTestId('konva-layer');
    
    expect(stage).toContainElement(layer);
    expect(layer).toContainElement(textNode);
  });
}); 