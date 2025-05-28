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

describe('Error Handling Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any console errors/warnings
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles edge creation with invalid node selections gracefully', async () => {
    render(<DiagramEditor />);

    const createEdgeButton = screen.getByText('Create Edge');
    const addTextButton = screen.getByText('Add Text Node');

    // Create a single node
    fireEvent.click(addTextButton);
    const textNode = screen.getByTestId(/^konva-text-/);

    // Enter edge creation mode
    fireEvent.click(createEdgeButton);
    expect(screen.getByText('Edge Creation Mode')).toBeInTheDocument();

    // Try to create edge with same source and target
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // Click the same node again (should handle gracefully)
    fireEvent.click(textNode);

    // Should remain in edge creation mode or handle gracefully
    await waitFor(() => {
      const statusText = screen.getByText(/Click on a node or edge to select it|Source selected/);
      expect(statusText).toBeInTheDocument();
    });

    // Try clicking on empty space during edge creation
    const stage = screen.getByTestId('konva-stage');
    fireEvent.click(stage);

    // Should exit edge creation mode gracefully
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });
  });

  it('handles text editing edge cases gracefully', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Enter edit mode
    fireEvent.doubleClick(textNode);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;

    // Test empty text handling
    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });

    // Node should still exist with default text or empty text
    expect(textNode).toBeInTheDocument();

    // Test very long text handling
    fireEvent.doubleClick(textNode);

    await waitFor(() => {
      const newTextarea = document.querySelector('textarea');
      expect(newTextarea).toBeInTheDocument();
    });

    const newTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const longText = 'A'.repeat(1000);
    fireEvent.change(newTextarea, { target: { value: longText } });
    fireEvent.keyDown(newTextarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });

    // Should handle long text gracefully
    expect(textNode).toBeInTheDocument();

    // Test special characters
    fireEvent.doubleClick(textNode);

    await waitFor(() => {
      const specialTextarea = document.querySelector('textarea');
      expect(specialTextarea).toBeInTheDocument();
    });

    const specialTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const specialText = '!@#$%^&*()_+{}|:"<>?[]\\;\',./ 中文 🚀';
    fireEvent.change(specialTextarea, { target: { value: specialText } });
    fireEvent.keyDown(specialTextarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });

    // Should handle special characters gracefully
    expect(textNode).toBeInTheDocument();
  });

  it('handles rapid button clicking without breaking state', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const createEdgeButton = screen.getByText('Create Edge');
    const clearButton = screen.getByText('Clear Canvas');

    // Rapid clicking of add buttons
    for (let i = 0; i < 20; i++) {
      fireEvent.click(addTextButton);
      fireEvent.click(addRectButton);
    }

    // Verify nodes were created
    const textNodes = screen.getAllByTestId(/konva-text-text-/);
    const rectNodes = screen.getAllByTestId(/konva-rect-rect-/);
    expect(textNodes.length).toBeGreaterThan(0);
    expect(rectNodes.length).toBeGreaterThan(0);

    // Rapid mode switching
    for (let i = 0; i < 10; i++) {
      fireEvent.click(createEdgeButton);
      fireEvent.click(createEdgeButton);
    }

    // Should be in normal mode
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();

    // Rapid clearing
    for (let i = 0; i < 5; i++) {
      fireEvent.click(clearButton);
    }

    // Should be cleared
    await waitFor(() => {
      expect(screen.queryByTestId(/konva-text-text-/)).not.toBeInTheDocument();
      expect(screen.queryByTestId(/konva-rect-rect-/)).not.toBeInTheDocument();
    });
  });

  it('handles node deletion edge cases gracefully', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const deleteButton = screen.getByText('Delete Selected');

    // Try deleting without selection
    expect(deleteButton).toBeDisabled();
    fireEvent.click(deleteButton);

    // Should remain in normal state
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();

    // Create nodes and edges
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/konva-text-text-/);
    expect(textNodes.length).toBe(2);

    // Create edge between nodes
    const createEdgeButton = screen.getByText('Create Edge');
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNodes[0]);

    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    fireEvent.click(textNodes[1]);

    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // Verify edge was created
    const edges = screen.getAllByTestId(/konva-(line|arrow)-edge_/);
    expect(edges.length).toBeGreaterThan(0);

    // Delete node that has connected edges
    fireEvent.click(textNodes[0]);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });

    fireEvent.click(deleteButton);

    // Should handle deletion gracefully
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // Connected edges should be handled appropriately
    const remainingNodes = screen.getAllByTestId(/konva-text-text-/);
    expect(remainingNodes.length).toBe(1);
  });

  it('handles edge selection and deletion edge cases', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const createEdgeButton = screen.getByText('Create Edge');
    const deleteButton = screen.getByText('Delete Selected');

    // Create nodes and edge
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/konva-text-text-/);

    fireEvent.click(createEdgeButton);
    fireEvent.click(textNodes[0]);

    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    fireEvent.click(textNodes[1]);

    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    const edges = screen.getAllByTestId(/konva-(line|arrow)-edge_/);
    expect(edges.length).toBeGreaterThan(0);

    // Try selecting edge
    fireEvent.click(edges[0]);

    await waitFor(() => {
      expect(screen.getByText(/Selected edge:/)).toBeInTheDocument();
    });

    // Delete edge
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });

    // Edge should be deleted
    const remainingEdges = screen.queryAllByTestId(/konva-(line|arrow)-edge_/);
    expect(remainingEdges.length).toBe(0);

    // Nodes should remain
    const remainingNodes = screen.getAllByTestId(/konva-text-text-/);
    expect(remainingNodes.length).toBe(2);
  });

  it('handles invalid drag operations gracefully', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Test drag with invalid coordinates
    fireEvent.dragEnd(textNode, {
      target: {
        x: () => NaN,
        y: () => NaN
      }
    });

    // Node should still be functional
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });

    // Test drag with extreme coordinates
    fireEvent.dragEnd(textNode, {
      target: {
        x: () => -10000,
        y: () => 10000
      }
    });

    // Node should still be functional
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });

    // Test drag with undefined coordinates
    fireEvent.dragEnd(textNode, {
      target: {
        x: () => undefined,
        y: () => undefined
      }
    });

    // Node should still be functional
    fireEvent.click(textNode);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });
  });

  it('handles keyboard events during text editing gracefully', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNode = screen.getByTestId(/^konva-text-/);

    // Enter edit mode
    fireEvent.doubleClick(textNode);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;

    // Test various keyboard events
    fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });

    // Should exit edit mode
    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });

    // Re-enter edit mode
    fireEvent.doubleClick(textNode);

    await waitFor(() => {
      const newTextarea = document.querySelector('textarea');
      expect(newTextarea).toBeInTheDocument();
    });

    const newTextarea = document.querySelector('textarea') as HTMLTextAreaElement;

    // Test Tab key
    fireEvent.keyDown(newTextarea, { key: 'Tab', code: 'Tab' });

    // Should handle gracefully (might exit or insert tab)
    // The exact behavior depends on implementation

    // Test Shift+Enter (should not exit edit mode)
    fireEvent.change(newTextarea, { target: { value: 'Line 1' } });
    fireEvent.keyDown(newTextarea, { key: 'Enter', code: 'Enter', shiftKey: true });

    // Should still be in edit mode or handle gracefully
    const textareaAfterShiftEnter = document.querySelector('textarea');
    if (textareaAfterShiftEnter) {
      // If still in edit mode, exit properly
      fireEvent.keyDown(textareaAfterShiftEnter, { key: 'Enter', code: 'Enter' });
    }

    await waitFor(() => {
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });
  });

  it('handles concurrent operations gracefully', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const createEdgeButton = screen.getByText('Create Edge');

    // Create nodes
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/konva-text-text-/);

    // Start edge creation
    fireEvent.click(createEdgeButton);
    fireEvent.click(textNodes[0]);

    await waitFor(() => {
      expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
    });

    // Try to start text editing while in edge creation mode
    fireEvent.doubleClick(textNodes[1]);

    // Should handle gracefully - either complete edge creation or enter text edit
    await waitFor(() => {
      const hasTextarea = document.querySelector('textarea');
      const hasEdgeMode = screen.queryByText('Source selected. Click on another node to create an edge.');
      const hasNormalMode = screen.queryByText('Click on a node or edge to select it');
      
      expect(hasTextarea || hasEdgeMode || hasNormalMode).toBeTruthy();
    });

    // Clean up any active modes
    if (document.querySelector('textarea')) {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });
    }

    if (screen.queryByText('Source selected. Click on another node to create an edge.')) {
      fireEvent.click(createEdgeButton); // Cancel edge creation
    }

    // Should return to normal state
    await waitFor(() => {
      expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    });
  });

  it('handles application state recovery after errors', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const clearButton = screen.getByText('Clear Canvas');

    // Create initial state
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/konva-text-text-/);
    expect(textNodes.length).toBe(2);

    // Simulate error scenario by triggering multiple rapid operations
    for (let i = 0; i < 10; i++) {
      fireEvent.click(textNodes[0]);
      fireEvent.doubleClick(textNodes[1]);
      
      const textarea = document.querySelector('textarea');
      if (textarea) {
        fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });
      }
    }

    // Application should still be functional
    fireEvent.click(textNodes[0]);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });

    // Clear and verify recovery
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByTestId(/konva-text-text-/)).not.toBeInTheDocument();
    });

    // Should be able to create new nodes
    fireEvent.click(addTextButton);
    const newNodes = screen.getAllByTestId(/konva-text-text-/);
    expect(newNodes.length).toBe(1);

    // Verify full functionality is restored
    fireEvent.click(newNodes[0]);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });
  });
}); 