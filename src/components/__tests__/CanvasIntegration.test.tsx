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

describe('Canvas Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with sample nodes and proper UI state', () => {
    render(<DiagramEditor />);

    // Check initial UI elements
    expect(screen.getByText('Add Text Node')).toBeInTheDocument();
    expect(screen.getByText('Add Rectangle')).toBeInTheDocument();
    expect(screen.getByText('Add Circle')).toBeInTheDocument();
    expect(screen.getByText('Create Edge')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    expect(screen.getByText('Clear Canvas')).toBeInTheDocument();

    // Check initial status
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();

    // Check canvas is rendered
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument();
    expect(screen.getByTestId('konva-layer')).toBeInTheDocument();

    // Check sample nodes are present (from initial state)
    const sampleNodes = screen.getAllByTestId(/^konva-(text|rect|circle)-/);
    expect(sampleNodes.length).toBeGreaterThan(0);
  });

  it('maintains consistent state across multiple operations', async () => {
    render(<DiagramEditor />);

    // Add nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    // Count total nodes (including sample nodes)
    const initialNodes = screen.getAllByTestId(/^konva-(text|rect|circle)-/);
    const initialNodeCount = initialNodes.length;

    // Create edge
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

    // Verify state consistency
    const nodesAfterEdge = screen.getAllByTestId(/^konva-(text|rect|circle)-/);
    expect(nodesAfterEdge).toHaveLength(initialNodeCount);

    // Select and move a node
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    fireEvent.dragEnd(textNode, {
      target: {
        x: () => 400,
        y: () => 300
      }
    });

    // State should remain consistent
    expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    expect(screen.getByTestId(/konva-(line|arrow)-edge_/)).toBeInTheDocument();
    expect(nodesAfterEdge).toHaveLength(initialNodeCount);
  });

  it('handles rapid user interactions without state corruption', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const createEdgeButton = screen.getByText('Create Edge');

    // Rapid node creation
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    // Verify all nodes were created
    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const rectNodes = screen.getAllByTestId(/^konva-rect-/);
    
    // Should have at least 2 of each type (plus any sample nodes)
    expect(textNodes.length).toBeGreaterThanOrEqual(2);
    expect(rectNodes.length).toBeGreaterThanOrEqual(2);

    // Rapid edge creation attempts
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNodes[0]);
    fireEvent.click(rectNodes[0]);

    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // Rapid selection changes
    fireEvent.click(textNodes[0]);
    fireEvent.click(rectNodes[0]);
    fireEvent.click(textNodes[1]);

    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });

    // State should be consistent
    expect(screen.getByTestId(/konva-(line|arrow)-edge_/)).toBeInTheDocument();
  });

  it('handles edge cases and error conditions gracefully', async () => {
    render(<DiagramEditor />);

    // Try to delete when nothing is selected
    const deleteButton = screen.getByText('Delete Selected');
    expect(deleteButton).toBeDisabled();

    // Add a node and test edge creation edge cases
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const createEdgeButton = screen.getByText('Create Edge');

    // Start edge creation
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);

    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // Try to create edge to same node (should not work)
    fireEvent.click(textNode);
    expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();

    // Cancel edge creation
    fireEvent.click(createEdgeButton);
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
  });

  it('maintains proper event propagation and isolation', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const stage = screen.getByTestId('konva-stage');

    // Node click should select node
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    // Stage click should deselect
    fireEvent.click(stage);
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // Double-click on node should enter edit mode
    fireEvent.doubleClick(textNode);
    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    // Clicking stage while editing should not interfere
    fireEvent.click(stage);
    expect(document.querySelector('textarea')).toBeInTheDocument();

    // Complete editing
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });
  });

  it('handles complex state transitions correctly', async () => {
    render(<DiagramEditor />);

    // Start with node creation
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);

    // State 1: Normal mode -> Edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();

    // State 2: Edge creation mode -> Source selected
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // State 3: Source selected -> Edge created (back to normal)
    fireEvent.click(rectNode);
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // State 4: Normal mode -> Node selected
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    // State 5: Node selected -> Text editing
    fireEvent.doubleClick(textNode);
    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    // State 6: Text editing -> Back to node selected
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'New Text' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    // State 7: Node selected -> Edge selected
    const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
    fireEvent.click(edgeElement);

    await waitFor(() => {
      expect(screen.getByText(/Selected edge:/)).toBeInTheDocument();
    });

    // All transitions should maintain data integrity
    expect(textNode).toHaveTextContent('New Text');
    expect(edgeElement).toBeInTheDocument();
  });

  it('handles memory management and cleanup properly', async () => {
    render(<DiagramEditor />);

    // Create many nodes and edges
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const createEdgeButton = screen.getByText('Create Edge');

    // Add multiple nodes
    for (let i = 0; i < 5; i++) {
      fireEvent.click(addTextButton);
      fireEvent.click(addRectButton);
    }

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const rectNodes = screen.getAllByTestId(/^konva-rect-/);

    // Create multiple edges
    for (let i = 0; i < Math.min(textNodes.length, rectNodes.length); i++) {
      fireEvent.click(createEdgeButton);
      fireEvent.click(textNodes[i]);
      await waitFor(() => {
        expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
      });
      fireEvent.click(rectNodes[i]);
      await waitFor(() => {
        expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
      });
    }

    // Verify edges were created
    const edges = screen.getAllByTestId(/konva-(line|arrow)-edge_/);
    expect(edges.length).toBeGreaterThan(0);

    // Clear everything
    const clearButton = screen.getByText('Clear Canvas');
    fireEvent.click(clearButton);

    // Verify cleanup
    await waitFor(() => {
      expect(screen.queryByTestId(/^konva-text-/)).not.toBeInTheDocument();
      expect(screen.queryByTestId(/^konva-rect-/)).not.toBeInTheDocument();
      expect(screen.queryByTestId(/konva-(line|arrow)-edge_/)).not.toBeInTheDocument();
    });

    // UI should be in clean state
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeDisabled();
  });

  it('handles concurrent operations and race conditions', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const createEdgeButton = screen.getByText('Create Edge');

    // Add nodes
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const firstNode = textNodes[0];
    const secondNode = textNodes[1];

    // Start edge creation
    fireEvent.click(createEdgeButton);
    fireEvent.click(firstNode);

    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // Simulate rapid operations that could cause race conditions
    fireEvent.click(secondNode); // Complete edge creation
    fireEvent.click(firstNode); // Try to select node immediately
    fireEvent.doubleClick(firstNode); // Try to edit immediately

    // System should handle this gracefully
    await waitFor(() => {
      // Either edge creation completed and node is selected, or text editing started
      const hasSelectedNode = screen.queryByText(/Selected node:/);
      const hasTextarea = document.querySelector('textarea');
      const hasEdge = screen.queryByTestId(/konva-(line|arrow)-edge_/);
      
      // At least one of these states should be true
      expect(hasSelectedNode || hasTextarea || hasEdge).toBeTruthy();
    });
  });

  it('maintains accessibility and user feedback throughout interactions', async () => {
    render(<DiagramEditor />);

    // Check that buttons have proper states
    const deleteButton = screen.getByText('Delete Selected');
    expect(deleteButton).toBeDisabled();

    // Add a node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Select node - delete button should become enabled
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
      expect(deleteButton).not.toBeDisabled();
    });

    // Enter edge creation mode - UI should provide clear feedback
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();
    expect(screen.getByText('Click on a node to select as source')).toBeInTheDocument();
    expect(createEdgeButton).toHaveTextContent('Cancel Edge Creation');

    // Select source - feedback should update
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // Cancel edge creation - UI should reset
    fireEvent.click(createEdgeButton);
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    expect(createEdgeButton).toHaveTextContent('Create Edge');
  });

  it('handles node selection and deselection correctly', async () => {
    render(<DiagramEditor />);
    
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const textNode = textNodes[textNodes.length - 1]; // Get the most recently added text node
    const stage = screen.getByTestId('konva-stage');

    // Node click should select node
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });

    // Stage click should deselect
    fireEvent.click(stage);
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });
  });

  it('handles node dragging correctly', async () => {
    render(<DiagramEditor />);
    
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const textNode = textNodes[textNodes.length - 1]; // Get the most recently added text node

    // Simulate drag
    fireEvent.mouseDown(textNode, { clientX: 200, clientY: 100 });
    fireEvent.mouseMove(textNode, { clientX: 300, clientY: 200 });
    fireEvent.mouseUp(textNode, { clientX: 300, clientY: 200 });

    await waitFor(() => {
      expect(textNode).toHaveAttribute('x', '300');
      expect(textNode).toHaveAttribute('y', '200');
    });
  });

  it('handles text editing functionality', async () => {
    render(<DiagramEditor />);
    
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const textNode = textNodes[textNodes.length - 1]; // Get the most recently added text node

    // Double click to enter edit mode
    fireEvent.doubleClick(textNode);

    // Should create a textarea for editing
    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('New Text');
    });

    // Edit the text
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Edited Text' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    // Should update the text node
    await waitFor(() => {
      expect(textNode).toHaveAttribute('text', 'Edited Text');
    });
  });

  it('handles complex state transitions correctly', async () => {
    render(<DiagramEditor />);
    
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const rectNodes = screen.getAllByTestId(/^konva-rect-/);
    const textNode = textNodes[textNodes.length - 1]; // Get the most recently added text node
    const rectNode = rectNodes[rectNodes.length - 1]; // Get the most recently added rect node

    // State 1: Normal mode -> Edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    
    expect(createEdgeButton).toHaveClass('bg-red-500');

    // State 2: Edge creation mode -> Select first node
    fireEvent.click(textNode);
    
    // State 3: First node selected -> Select second node (creates edge)
    fireEvent.click(rectNode);
    
    // Should create an edge and return to normal mode
    await waitFor(() => {
      expect(createEdgeButton).toHaveClass('bg-orange-500');
      const edges = screen.getAllByTestId(/^konva-line-edge/);
      expect(edges.length).toBeGreaterThan(50); // Grid lines + actual edge
    });
  });

  it('maintains accessibility and user feedback throughout interactions', async () => {
    render(<DiagramEditor />);
    
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const textNode = textNodes[textNodes.length - 1]; // Get the most recently added text node

    // Select node - delete button should become enabled
    fireEvent.click(textNode);
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Selected');
      expect(deleteButton).not.toHaveAttribute('disabled');
    });

    // Deselect - delete button should become disabled
    const stage = screen.getByTestId('konva-stage');
    fireEvent.click(stage);
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Selected');
      expect(deleteButton).toHaveAttribute('disabled');
    });
  });
}); 