import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagramEditor from '@/app/page';
import Konva from 'konva'; // Import Konva for types

// Mock Konva components for performance testing
jest.mock('react-konva', () => {
  const mockStageInstance: any = {
    container: jest.fn(() => ({
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 800,
        height: 600
      }))
    })),
    scaleX: jest.fn(() => 1),
    getStage: jest.fn(() => mockStageInstance), // Stage returns itself
    x: jest.fn(() => 0), // Add x mock
    y: jest.fn(() => 0), // Add y mock
    getPointerPosition: jest.fn(() => ({ x: 0, y: 0 })), // Add getPointerPosition mock
    getAbsoluteTransform: jest.fn(() => ({ // Add getAbsoluteTransform mock
      copy: jest.fn(() => ({
        invert: jest.fn(() => ({
          point: jest.fn((pos: {x: number, y: number}) => pos) // Add type for pos
        }))
      }))
    })),
    findOne: jest.fn((selector: string) => {
      const id = selector.substring(1);
      // This mock needs to be able to find nodes by their actual props.id
      // For now, we return a generic ref based on type if not found by static mock IDs
      if (mockTextRef.id === id) return mockTextRef;
      if (mockRectRef.id === id) return mockRectRef;
      if (mockCircleRef.id === id) return mockCircleRef;
      // A proper mock would need access to the nodes array from the component or a more dynamic way to find nodes
      // Fallback for dynamic nodes based on selector content
      if (selector.includes('text')) return { ...mockTextRef, id: () => id };
      if (selector.includes('rect')) return { ...mockRectRef, id: () => id };
      if (selector.includes('circle')) return { ...mockCircleRef, id: () => id };
      return null;
    })
  };

  const mockNodeGetStage = jest.fn(() => mockStageInstance);

  const mockTextRef = {
    id: 'mock-text-node-static',
    getStage: mockNodeGetStage,
    getAbsolutePosition: jest.fn(() => ({ x: 50, y: 50 })),
    width: jest.fn(() => 100),
    height: jest.fn(() => 20),
    draggable: jest.fn(),
    x: jest.fn(() => 50), // Add x mock for drag end
    y: jest.fn(() => 50),  // Add y mock for drag end
    name: jest.fn(() => 'text-shape')
  };

  const mockRectRef = {
    id: 'mock-rect-node-static',
    getStage: mockNodeGetStage,
    getAbsolutePosition: jest.fn(() => ({ x: 100, y: 100 })),
    width: jest.fn(() => 100),
    height: jest.fn(() => 100),
    draggable: jest.fn(),
    x: jest.fn(() => 100),
    y: jest.fn(() => 100),
    name: jest.fn(() => 'rect-shape')
  };

  const mockCircleRef = {
    id: 'mock-circle-node-static',
    getStage: mockNodeGetStage,
    getAbsolutePosition: jest.fn(() => ({ x: 150, y: 150 })),
    width: jest.fn(() => 80), // Represents diameter for circle in our app
    height: jest.fn(() => 80),// Represents diameter for circle in our app
    draggable: jest.fn(),
    x: jest.fn(() => 150),
    y: jest.fn(() => 150),
    name: jest.fn(() => 'circle-shape')
  };
  
  const mockTransformerRef = {
    nodes: jest.fn(),
    getStage: mockNodeGetStage,
    getLayer: jest.fn(() => ({
      batchDraw: jest.fn()
    })),
    detach: jest.fn(),
    hide: jest.fn(),
    isVisible: jest.fn(() => false),
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
          }}
          onDoubleClick={(e) => {
            const mockEvent = { ...e, target: currentMockNode, currentTarget: currentMockNode } as unknown as Konva.KonvaEventObject<MouseEvent>;
            if (onDblClick) onDblClick(mockEvent);
          }}
          onDragEnd={(e) => {
            const mockEvent = { ...e, target: currentMockNode, currentTarget: currentMockNode } as unknown as Konva.KonvaEventObject<MouseEvent>;
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

// Performance monitoring utilities
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

const measureAsyncPerformance = async (name: string, fn: () => Promise<void>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

describe('Performance Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles large numbers of nodes efficiently', async () => {
    const { container } = render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const addCircleButton = screen.getByText('Add Circle');

    // Create a large number of nodes
    const nodeCount = 50;
    const createTime = measurePerformance('create-nodes', () => {
      for (let i = 0; i < nodeCount; i++) {
        if (i % 3 === 0) {
          fireEvent.click(addTextButton);
        } else if (i % 3 === 1) {
          fireEvent.click(addRectButton);
        } else {
          fireEvent.click(addCircleButton);
        }
      }
    });

    // Verify all nodes were created
    await waitFor(() => {
      const allNodes = screen.getAllByTestId(/^konva-(text|rect|circle)-/);
      expect(allNodes.length).toBeGreaterThanOrEqual(nodeCount);
    });

    // Performance should be reasonable (less than 1 second for 50 nodes)
    expect(createTime).toBeLessThan(1000);

    // Test selection performance with many nodes
    const textNodes = screen.getAllByTestId(/^konva-text-/);
    if (textNodes.length > 0) {
      const selectionTime = measurePerformance('select-node', () => {
        fireEvent.click(textNodes[0]);
      });

      await waitFor(() => {
        expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
      });

      // Selection should be fast even with many nodes
      expect(selectionTime).toBeLessThan(100);
    }

    // Test canvas clearing performance
    const clearButton = screen.getByText('Clear Canvas');
    const clearTime = measurePerformance('clear-canvas', () => {
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId(/^konva-text-/)).not.toBeInTheDocument();
    });

    // Clearing should be fast
    expect(clearTime).toBeLessThan(500);
  });

  it('handles rapid user interactions without performance degradation', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');

    // Rapid node creation
    const rapidCreationTime = measurePerformance('rapid-creation', () => {
      for (let i = 0; i < 20; i++) {
        fireEvent.click(addTextButton);
        fireEvent.click(addRectButton);
      }
    });

    // Should handle rapid creation efficiently
    expect(rapidCreationTime).toBeLessThan(500);

    // Get created nodes
    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const rectNodes = screen.getAllByTestId(/^konva-rect-/);

    // Rapid selection changes
    const rapidSelectionTime = measurePerformance('rapid-selection', () => {
      for (let i = 0; i < Math.min(10, textNodes.length); i++) {
        fireEvent.click(textNodes[i]);
        if (i < rectNodes.length) {
          fireEvent.click(rectNodes[i]);
        }
      }
    });

    // Selection changes should be fast
    expect(rapidSelectionTime).toBeLessThan(200);

    // Verify final state is consistent
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });
  });

  it('maintains performance during edge creation with many nodes', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const createEdgeButton = screen.getByText('Create Edge');

    // Create multiple nodes first
    for (let i = 0; i < 20; i++) {
      fireEvent.click(addTextButton);
    }

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    expect(textNodes.length).toBeGreaterThanOrEqual(20);

    // Test edge creation performance
    const edgeCreationTime = await measureAsyncPerformance('edge-creation', async () => {
      for (let i = 0; i < Math.min(10, textNodes.length - 1); i++) {
        fireEvent.click(createEdgeButton);
        fireEvent.click(textNodes[i]);
        
        await waitFor(() => {
          expect(screen.getByText('Source selected. Click on another node to create an edge.')).toBeInTheDocument();
        });
        
        fireEvent.click(textNodes[i + 1]);
        
        await waitFor(() => {
          expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
        });
      }
    });

    // Edge creation should be reasonably fast even with many nodes
    expect(edgeCreationTime).toBeLessThan(5000);

    // Verify edges were created
    const edges = screen.getAllByTestId(/konva-(line|arrow)-edge_/);
    expect(edges.length).toBeGreaterThan(0);
  });

  it('handles memory efficiently during node dragging operations', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');

    // Create nodes
    for (let i = 0; i < 15; i++) {
      fireEvent.click(addTextButton);
    }

    const textNodes = screen.getAllByTestId(/^konva-text-/);

    // Simulate multiple drag operations
    const dragTime = measurePerformance('multiple-drags', () => {
      textNodes.slice(0, 10).forEach((node, index) => {
        fireEvent.dragEnd(node, {
          target: {
            x: () => 100 + index * 50,
            y: () => 100 + index * 30
          }
        });
      });
    });

    // Dragging should be efficient
    expect(dragTime).toBeLessThan(300);

    // Verify nodes are still functional after dragging
    fireEvent.click(textNodes[0]);
    await waitFor(() => {
      expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
    });
  });

  it('maintains UI responsiveness during text editing operations', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const textNode = textNodes[textNodes.length - 1]; // Target the last added text node

    // Test rapid text editing
    const editingTime = await measureAsyncPerformance('text-editing', async () => {
      // Enter edit mode
      fireEvent.doubleClick(textNode);
      
      await waitFor(() => {
        const textarea = document.querySelector('textarea');
        expect(textarea).toBeInTheDocument();
      });

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;

      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        fireEvent.change(textarea, { target: { value: `Text ${i}` } });
      }

      // Complete editing
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(document.querySelector('textarea')).not.toBeInTheDocument();
      });
    });

    // Text editing should be responsive
    expect(editingTime).toBeLessThan(500);

    // Verify final state
    expect(textNode).toHaveTextContent('Text 9');
  });

  it('handles stress testing with mixed operations', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const createEdgeButton = screen.getByText('Create Edge');
    const deleteButton = screen.getByText('Delete Selected');

    // Stress test with mixed operations
    const stressTestTime = await measureAsyncPerformance('stress-test', async () => {
      // Phase 1: Rapid creation
      for (let i = 0; i < 15; i++) {
        fireEvent.click(addTextButton);
        fireEvent.click(addRectButton);
      }

      const textNodes = screen.getAllByTestId(/^konva-text-/);
      const rectNodes = screen.getAllByTestId(/^konva-rect-/);

      // Phase 2: Edge creation
      for (let i = 0; i < Math.min(5, textNodes.length, rectNodes.length); i++) {
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

      // Phase 3: Selection and deletion
      for (let i = 0; i < Math.min(5, textNodes.length); i++) {
        fireEvent.click(textNodes[i]);
        await waitFor(() => {
          expect(screen.getByText(/Selected node:/)).toBeInTheDocument();
        });
        fireEvent.click(deleteButton);
        await waitFor(() => {
          expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
        });
      }

      // Phase 4: Text editing
      const remainingNodes = screen.getAllByTestId(/^konva-text-/);
      if (remainingNodes.length > 0) {
        fireEvent.doubleClick(remainingNodes[0]);
        
        await waitFor(() => {
          const textarea = document.querySelector('textarea');
          expect(textarea).toBeInTheDocument();
        });

        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'Stress Test Text' } });
        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
          expect(document.querySelector('textarea')).not.toBeInTheDocument();
        });
      }
    });

    // Stress test should complete in reasonable time
    expect(stressTestTime).toBeLessThan(3000);

    // Verify application is still functional
    fireEvent.click(addTextButton);
    const newNodes = screen.getAllByTestId(/^konva-text-/);
    expect(newNodes.length).toBeGreaterThan(0);
  });

  it('efficiently handles canvas clearing with large datasets', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const addRectButton = screen.getByText('Add Rectangle');
    const createEdgeButton = screen.getByText('Create Edge');
    const clearButton = screen.getByText('Clear Canvas');

    // Create a large dataset
    for (let i = 0; i < 30; i++) {
      fireEvent.click(addTextButton);
      fireEvent.click(addRectButton);
    }

    const textNodes = screen.getAllByTestId(/^konva-text-/);
    const rectNodes = screen.getAllByTestId(/^konva-rect-/);

    // Create multiple edges
    for (let i = 0; i < Math.min(10, textNodes.length, rectNodes.length); i++) {
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

    // Verify large dataset exists
    const allNodes = screen.getAllByTestId(/konva-(text|rect|circle)-/);
    const allEdges = screen.getAllByTestId(/konva-(line|arrow)-edge_/);
    expect(allNodes.length).toBeGreaterThan(50);
    expect(allEdges.length).toBeGreaterThan(5);

    // Test clearing performance
    const clearTime = measurePerformance('clear-large-dataset', () => {
      fireEvent.click(clearButton);
    });

    // Clearing should be fast even with large datasets
    expect(clearTime).toBeLessThan(200);

    // Verify everything was cleared
    await waitFor(() => {
      expect(screen.queryByTestId(/^konva-text-/)).not.toBeInTheDocument();
      expect(screen.queryByTestId(/^konva-rect-/)).not.toBeInTheDocument();
      expect(screen.queryByTestId(/konva-(line|arrow)-edge_/)).not.toBeInTheDocument();
    });

    // Verify application is ready for new operations
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeDisabled();
  });

  it('maintains performance during rapid mode switching', async () => {
    render(<DiagramEditor />);

    const addTextButton = screen.getByText('Add Text Node');
    const createEdgeButton = screen.getByText('Create Edge');

    // Create some nodes
    fireEvent.click(addTextButton);
    fireEvent.click(addTextButton);

    const textNodes = screen.getAllByTestId(/^konva-text-/);

    // Test rapid mode switching
    const modeSwitchTime = await measureAsyncPerformance('mode-switching', async () => {
      for (let i = 0; i < 10; i++) {
        // Enter edge creation mode
        fireEvent.click(createEdgeButton);
        await waitFor(() => {
          expect(createEdgeButton).toHaveClass('bg-red-500');
        });

        // Exit edge creation mode by clicking stage
        const stage = screen.getByTestId('konva-stage');
        fireEvent.click(stage);
        await waitFor(() => {
          // Check if we're back to normal mode (either no selection or deselected state)
          const statusText = screen.getByText(/^(Click on a node or edge to select it|Selected node:)/);
          expect(statusText).toBeInTheDocument();
        });
      }
    });

    // Mode switching should be fast
    expect(modeSwitchTime).toBeLessThan(1000);

    // Verify final state is correct
    expect(screen.getByText('Click on a node or edge to select it')).toBeInTheDocument();
    expect(createEdgeButton).toHaveTextContent('Create Edge');
  });
}); 