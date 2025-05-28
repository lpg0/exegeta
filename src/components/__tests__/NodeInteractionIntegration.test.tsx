import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagramEditor from '@/app/page';
import Konva from 'konva'; // Import Konva for types

jest.mock('react-konva', () => {
  const mockStageInstance: any = { 
    container: jest.fn(() => ({ getBoundingClientRect: jest.fn(() => ({ left: 100, top: 100, width: 800, height: 600 })) })),
    scaleX: jest.fn(() => 1),
    getStage: jest.fn(() => mockStageInstance),
    x: jest.fn(() => 0),
    y: jest.fn(() => 0),
    getPointerPosition: jest.fn(() => ({ x: 0, y: 0 })),
    getAbsoluteTransform: jest.fn(() => ({ copy: jest.fn(() => ({ invert: jest.fn(() => ({ point: jest.fn((pos: {x: number, y: number}) => pos) })) })) })),
    findOne: jest.fn((selector: string) => {
      const id = selector.substring(1);
      if (mockTextRef.id === id) return { ...mockTextRef, id: () => id, attrs: { id } };
      if (mockRectRef.id === id) return { ...mockRectRef, id: () => id, attrs: { id } };
      if (mockCircleRef.id === id) return { ...mockCircleRef, id: () => id, attrs: { id } };
      if (selector.startsWith('#')) {
        if (id.includes('text')) return { ...mockTextRef, id: () => id, attrs: { id, 'data-testid': `konva-text-${id}` }};
        if (id.includes('rect')) return { ...mockRectRef, id: () => id, attrs: { id, 'data-testid': `konva-rect-${id}` }};
        if (id.includes('circle')) return { ...mockCircleRef, id: () => id, attrs: { id, 'data-testid': `konva-circle-${id}` }};
      }
      return null;
    })
  };

  const mockNodeGetStage = jest.fn(() => mockStageInstance);

  const mockTextRef: any = { id: 'mock-text-node-static', getStage: mockNodeGetStage, getAbsolutePosition: jest.fn(() => ({ x: 50, y: 50 })), width: jest.fn(() => 100), height: jest.fn(() => 20), draggable: jest.fn(), x: jest.fn(() => 50), y: jest.fn(() => 50), name: jest.fn(() => 'text-shape'), attrs: {} }; 
  const mockRectRef: any = { id: 'mock-rect-node-static', getStage: mockNodeGetStage, getAbsolutePosition: jest.fn(() => ({ x: 100, y: 100 })), width: jest.fn(() => 100), height: jest.fn(() => 100), draggable: jest.fn(), x: jest.fn(() => 100), y: jest.fn(() => 100), name: jest.fn(() => 'rect-shape'), attrs: {} };
  const mockCircleRef: any = { id: 'mock-circle-node-static', getStage: mockNodeGetStage, getAbsolutePosition: jest.fn(() => ({ x: 150, y: 150 })), width: jest.fn(() => 80), height: jest.fn(() => 80), draggable: jest.fn(), x: jest.fn(() => 150), y: jest.fn(() => 150), name: jest.fn(() => 'circle-shape'), attrs: {} };
  const mockTransformerRef: { nodes: jest.Mock<any, any, any>; getStage: jest.Mock<any, any, any>; getLayer: jest.Mock<any, any, any>; detach: jest.Mock<any, any, any>; hide: jest.Mock<any, any, any>; show: jest.Mock<any, any, any>; isVisible: jest.Mock<any, any, any>; _nodes: any[] } = { 
    nodes: jest.fn((newNodes) => {
      (mockTransformerRef as any)._nodes = newNodes;
    }), 
    getStage: mockNodeGetStage, 
    getLayer: jest.fn(() => ({ batchDraw: jest.fn() })), 
    detach: jest.fn(), 
    hide: jest.fn(), 
    show: jest.fn(), 
    isVisible: jest.fn(() => ((mockTransformerRef as any)._nodes && (mockTransformerRef as any)._nodes.length > 0)), 
    _nodes: [] 
  };

  return {
    Stage: React.forwardRef<any, any>(({ children, onClick, onDragEnd, onWheel, ...props }, ref) => {
      React.useEffect(() => {
        if (ref && typeof ref === 'object') { ref.current = mockStageInstance; }
      }, [ref]);
      return <div data-testid="konva-stage" {...props} onClick={(e) => {
        const mockEvent = { ...e, target: mockStageInstance, currentTarget: mockStageInstance } as unknown as Konva.KonvaEventObject<MouseEvent>; 
        if (onClick) onClick(mockEvent);
      }}>{children}</div>;
    }),
    Layer: React.forwardRef<any, any>(({ children, ...props }, ref) => <div data-testid="konva-layer" {...props}>{children}</div>),
    Text: React.forwardRef<any, any>(({ onClick, onDblClick, onDragEnd, onTap, ...props }, ref) => {
      const currentMockNode = { ...mockTextRef, id: () => props.id, attrs: props, name: () => 'text-shape' };
      React.useEffect(() => { if (ref && typeof ref === 'object') { ref.current = currentMockNode; } }, [ref, props.id]);
      return (
        <div
          data-testid={`konva-text-${props.id}`}
          {...props}
          onClick={(e) => {
            const mockEvent = { ...e, target: currentMockNode, currentTarget: currentMockNode } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onClick) onClick(mockEvent);
            if (onTap) onTap(mockEvent as any);
          }}
          onDoubleClick={(e) => {
            const mockEvent = { ...e, target: currentMockNode, currentTarget: currentMockNode } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onDblClick) onDblClick(mockEvent);
          }}
          onDragEnd={(e) => {
            const mockEvent = { ...e, target: { ...currentMockNode, x: () => parseFloat(props.x) || 0, y: () => parseFloat(props.y) || 0 } } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onDragEnd) onDragEnd(mockEvent); 
          }}
        >
          {props.text}
        </div>
      );
    }),
    Rect: React.forwardRef<any, any>(({ onClick, onDblClick, onDragEnd, onTap, ...props }, ref) => {
      const currentMockNode = { ...mockRectRef, id: () => props.id, attrs: props, name: () => 'rect-shape' };
      React.useEffect(() => { if (ref && typeof ref === 'object') { ref.current = currentMockNode; } }, [ref, props.id]);
      return (
        <div
          data-testid={`konva-rect-${props.id}`}
          {...props}
          onClick={(e) => {
            const mockEvent = { ...e, target: currentMockNode, currentTarget: currentMockNode } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onClick) onClick(mockEvent);
            if (onTap) onTap(mockEvent as any);
          }}
          onDragEnd={(e) => {
            const mockEvent = { ...e, target: { ...currentMockNode, x: () => parseFloat(props.x) || 0, y: () => parseFloat(props.y) || 0 } } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onDragEnd) onDragEnd(mockEvent); 
          }}
        />
      );
    }),
    Circle: React.forwardRef<any, any>(({ onClick, onDblClick, onDragEnd, onTap, ...props }, ref) => {
      const currentMockNode = { ...mockCircleRef, id: () => props.id, attrs: props, name: () => 'circle-shape' };
      React.useEffect(() => { if (ref && typeof ref === 'object') { ref.current = currentMockNode; } }, [ref, props.id]);
      return (
        <div
          data-testid={`konva-circle-${props.id}`}
          {...props}
          onClick={(e) => {
            const mockEvent = { ...e, target: currentMockNode, currentTarget: currentMockNode } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onClick) onClick(mockEvent);
            if (onTap) onTap(mockEvent as any);
          }}
           onDragEnd={(e) => {
            const mockEvent = { ...e, target: { ...currentMockNode, x: () => parseFloat(props.x) || 0, y: () => parseFloat(props.y) || 0 } } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onDragEnd) onDragEnd(mockEvent); 
          }}
        />
      );
    }),
    Line: ({ points, onClick, ...props }: any) => (
      <div
        data-testid={`konva-line-${props.id || 'edge'}`}
        data-points={JSON.stringify(points)}
        onClick={onClick}
        {...props}
      />
    ),
    Arrow: ({ points, onClick, ...props }: any) => (
      <div
        data-testid={`konva-arrow-${props.id || 'edge'}`}
        data-points={JSON.stringify(points)}
        onClick={onClick}
        {...props}
      />
    ),
    Transformer: React.forwardRef<any, any>(({ children, ...props }, ref) => {
      React.useEffect(() => {
        if (ref && typeof ref === 'object') {
          ref.current = mockTransformerRef;
        }
      }, [ref]);
      return <div data-testid="konva-transformer" {...props}>{children}</div>;
    })
  };
});

describe('Node Interaction Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles node selection and deselection through full workflow', async () => {
    render(<DiagramEditor />);

    // Add multiple nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    // Initially no selection
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();

    // Select first node
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    // Select second node (should deselect first)
    fireEvent.click(rectNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: rect-1/)).toBeInTheDocument();
    });

    // Click on canvas to deselect
    const stage = screen.getByTestId('konva-stage');
    fireEvent.click(stage);
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });
  });

  it('handles node dragging and position updates', async () => {
    render(<DiagramEditor />);

    // Add a node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Simulate drag end event
    fireEvent.dragEnd(textNode, {
      target: {
        x: () => 300,
        y: () => 200
      }
    });

    // The node should maintain its functionality after dragging
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });
  });

  it('integrates node movement with edge updates', async () => {
    render(<DiagramEditor />);

    // Add two nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    // Create an edge between them
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(rectNode);

    // Verify edge is created
    await waitFor(() => {
      const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
      expect(edgeElement).toBeInTheDocument();
    });

    // Move one of the nodes
    fireEvent.dragEnd(textNode, {
      target: {
        x: () => 400,
        y: () => 300
      }
    });

    // Edge should still exist (connection points updated)
    const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
    expect(edgeElement).toBeInTheDocument();
  });

  it('handles text editing integration with node selection', async () => {
    render(<DiagramEditor />);

    // Add a text node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Select the node
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    // Double-click to edit
    fireEvent.doubleClick(textNode);

    // Should enter edit mode (textarea appears)
    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Edited Text' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    // After editing, node should still be selectable
    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
      expect(textNode).toHaveTextContent('Edited Text');
    });

    // Node should still be selected after editing
    expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
  });

  it('handles deletion of selected nodes and their edges', async () => {
    render(<DiagramEditor />);

    // Add two nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    // Create an edge
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(rectNode);

    await waitFor(() => {
      const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
      expect(edgeElement).toBeInTheDocument();
    });

    // Select and delete a node
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Selected');
    expect(deleteButton).not.toBeDisabled();
    fireEvent.click(deleteButton);

    // Node should be removed
    await waitFor(() => {
      expect(screen.queryByTestId(/^konva-text-/)).not.toBeInTheDocument();
    });

    // Edge should also be removed
    expect(screen.queryByTestId(/konva-(line|arrow)-edge_/)).not.toBeInTheDocument();

    // Selection should be cleared
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
  });

  it('handles edge selection and deletion', async () => {
    render(<DiagramEditor />);

    // Add two nodes and create an edge
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(rectNode);

    await waitFor(() => {
      const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
      expect(edgeElement).toBeInTheDocument();
    });

    // Select the edge
    const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
    fireEvent.click(edgeElement);

    await waitFor(() => {
      expect(screen.getByText(/Selected edge:/)).toBeInTheDocument();
    });

    // Delete the edge
    const deleteButton = screen.getByText('Delete Selected');
    expect(deleteButton).not.toBeDisabled();
    fireEvent.click(deleteButton);

    // Edge should be removed
    await waitFor(() => {
      expect(screen.queryByTestId(/konva-(line|arrow)-edge_/)).not.toBeInTheDocument();
    });

    // Nodes should still exist
    expect(screen.getByTestId(/^konva-text-/)).toBeInTheDocument();
    expect(screen.getByTestId(/^konva-rect-/)).toBeInTheDocument();
  });

  it('handles canvas clearing functionality', async () => {
    render(<DiagramEditor />);

    // Add multiple nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const addCircleButton = screen.getByText('Add Circle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);
    fireEvent.click(addCircleButton);

    // Verify nodes exist
    expect(screen.getByTestId(/^konva-text-/)).toBeInTheDocument();
    expect(screen.getByTestId(/^konva-rect-/)).toBeInTheDocument();
    expect(screen.getByTestId('konva-circle-circle-1')).toBeInTheDocument();

    // Create edges
    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(rectNode);

    await waitFor(() => {
      const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
      expect(edgeElement).toBeInTheDocument();
    });

    // Clear canvas
    const clearButton = screen.getByText('Clear Canvas');
    fireEvent.click(clearButton);

    // All nodes and edges should be removed
    await waitFor(() => {
      expect(screen.queryByTestId(/^konva-text-/)).not.toBeInTheDocument();
      expect(screen.queryByTestId(/^konva-rect-/)).not.toBeInTheDocument();
      expect(screen.queryByTestId('konva-circle-circle-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId(/konva-(line|arrow)-edge_/)).not.toBeInTheDocument();
    });

    // Selection should be cleared
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
  });

  it('handles complex interaction scenarios with multiple operations', async () => {
    render(<DiagramEditor />);

    // Add nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    // 1. Select text node
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    // 2. Edit text
    fireEvent.doubleClick(textNode);
    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Complex Test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
      expect(textNode).toHaveTextContent('Complex Test');
    });

    // 3. Create edge
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(rectNode);

    await waitFor(() => {
      const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
      expect(edgeElement).toBeInTheDocument();
    });

    // 4. Move node (should update edge)
    fireEvent.dragEnd(textNode, {
      target: {
        x: () => 500,
        y: () => 400
      }
    });

    // 5. Select edge and verify it still exists
    const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
    fireEvent.click(edgeElement);

    await waitFor(() => {
      expect(screen.getByText(/Selected edge:/)).toBeInTheDocument();
    });

    // 6. Switch back to node selection
    fireEvent.click(rectNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: rect-1/)).toBeInTheDocument();
    });

    // All elements should still be functional
    expect(textNode).toHaveTextContent('Complex Test');
    expect(edgeElement).toBeInTheDocument();
  });

  it('prevents interactions during edge creation mode', async () => {
    render(<DiagramEditor />);

    // Add nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    // Enter edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    // Try to edit text while in edge creation mode
    fireEvent.doubleClick(textNode);

    // Should not enter edit mode (no textarea)
    expect(document.querySelector('textarea')).not.toBeInTheDocument();

    // Should still be in edge creation mode
    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();

    // Complete edge creation
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(rectNode);

    // Now text editing should work again
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    fireEvent.doubleClick(textNode);
    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });
  });
}); 