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

describe('Edge Creation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an edge between two nodes through the full workflow', async () => {
    render(<DiagramEditor />);

    // Add two nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);

    // Verify nodes are added
    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);
    expect(textNode).toBeInTheDocument();
    expect(rectNode).toBeInTheDocument();

    // Enter edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    // Verify UI shows edge creation mode
    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();
    expect(screen.getByText('Click on a node to select as source')).toBeInTheDocument();
    expect(createEdgeButton).toHaveTextContent('Cancel Edge Creation');

    // Click on first node (source)
    fireEvent.click(textNode);

    // Verify source selection feedback
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // Click on second node (target)
    fireEvent.click(rectNode);

    // Verify edge creation completes and mode resets
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
      expect(createEdgeButton).toHaveTextContent('Create Edge');
    });

    // Verify edge is created (check for edge element)
    const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
    expect(edgeElement).toBeInTheDocument();
  });

  it('cancels edge creation when clicking cancel button', async () => {
    render(<DiagramEditor />);

    // Add a node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    // Enter edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();
    expect(createEdgeButton).toHaveTextContent('Cancel Edge Creation');

    // Cancel edge creation
    fireEvent.click(createEdgeButton);

    // Verify mode is reset
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    expect(createEdgeButton).toHaveTextContent('Create Edge');
  });

  it('handles edge creation between different node types', async () => {
    render(<DiagramEditor />);

    // Add different types of nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addCircleButton = screen.getByText('Add Circle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addCircleButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const circleNode = screen.getByTestId(/^konva-circle-/);

    // Create edge from text to circle
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    fireEvent.click(circleNode);

    // Verify edge creation
    await waitFor(() => {
      const edgeElement = screen.getByTestId(/konva-(line|arrow)-edge_/);
      expect(edgeElement).toBeInTheDocument();
    });
  });

  it('prevents creating edge to the same node', async () => {
    render(<DiagramEditor />);

    // Add a node
    const addRectButton = screen.getByText('Add Rectangle');
    fireEvent.click(addRectButton);

    const rectNode = screen.getByTestId(/^konva-rect-/);

    // Enter edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    // Select same node as both source and target
    fireEvent.click(rectNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    fireEvent.click(rectNode);

    // Should still be in edge creation mode (no edge created)
    expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
  });

  it('allows creating multiple edges between different node pairs', async () => {
    render(<DiagramEditor />);

    // Add three nodes
    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const addCircleButton = screen.getByText('Add Circle');
    
    fireEvent.click(addTextButton);
    fireEvent.click(addRectButton);
    fireEvent.click(addCircleButton);

    const textNode = screen.getByTestId(/^konva-text-/);
    const rectNode = screen.getByTestId(/^konva-rect-/);
    const circleNode = screen.getByTestId(/^konva-circle-/);

    const createEdgeButton = screen.getByText('Create Edge');

    // Create first edge: text -> rect
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(rectNode);

    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // Create second edge: rect -> circle
    fireEvent.click(createEdgeButton);
    fireEvent.click(rectNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });
    fireEvent.click(circleNode);

    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // Verify both edges exist
    const edgeElements = screen.getAllByTestId(/konva-(line|arrow)-edge_/);
    expect(edgeElements).toHaveLength(2);
  });

  it('maintains edge creation state when clicking on canvas', async () => {
    render(<DiagramEditor />);

    // Add a node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    // Enter edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();

    // Click on empty canvas area
    const stage = screen.getByTestId('konva-stage');
    fireEvent.click(stage);

    // Should still be in edge creation mode
    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();
    expect(screen.getByText('Click on a node to select as source')).toBeInTheDocument();
  });

  it('resets edge creation state after selecting source and clicking canvas', async () => {
    render(<DiagramEditor />);

    // Add a node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Enter edge creation mode and select source
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNode);

    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // Click on empty canvas area
    const stage = screen.getByTestId('konva-stage');
    fireEvent.click(stage);

    // Should reset to initial edge creation state
    expect(screen.getByText('Click on a node to select as source')).toBeInTheDocument();
  });

  it('integrates with node selection - deselects nodes when entering edge creation mode', async () => {
    render(<DiagramEditor />);

    // Add a node
    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Select the node first
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node: text-1/)).toBeInTheDocument();
    });

    // Enter edge creation mode
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);

    // Node should be deselected
    expect(screen.getByText('Click on a node to select as source')).toBeInTheDocument();
    expect(screen.queryByText(/Selected node:/)).not.toBeInTheDocument();
  });
}); 