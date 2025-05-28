import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Canvas from '../Canvas';
import { DiagramNode } from '@/types/nodes';

// Mock Konva components
// THIS VARIABLE WILL HOLD THE MOCK API FOR THE TRANSFORMER
// It's defined outside jest.mock so tests can access its 'current' property.
const mockedTransformerAPIContainer: { current: any } = { current: null };

jest.mock('react-konva', () => {
  // Initialize the mock API for the Transformer here, so it's in the closure
  // This object will be the actual ref.current for the Transformer in tests.
  const transformerMockSingleton = {
    onTransformEndCallback: null as ((e: any) => void) | null,
    nodes: jest.fn(),
    getLayer: jest.fn(() => ({ batchDraw: jest.fn() })),
    getStage: jest.fn(() => ({
      findOne: jest.fn((selector: string) => {
        const id = selector.substring(1); // e.g., 'rect-1'
        let nodeTypeAttr = 'rectangle'; // default assumption
        if (id.includes('circle')) nodeTypeAttr = 'circle';
        else if (id.includes('text')) nodeTypeAttr = 'text';
        // else it remains 'rectangle' or a generic shape type

        // Return a mock Konva node sufficient for Transformer attachment logic in Canvas.tsx
        return {
          id: () => id,
          // getType() is for Konva's internal type.
          // Canvas.tsx checks: node.getType() !== 'Group' && node.attrs.type !== 'text'
          getType: () => (nodeTypeAttr === 'text' ? 'Text' : 'Shape'), // Mock Konva types. 'Text' or 'Shape'
          attrs: { type: nodeTypeAttr }, // This is our custom 'type' used in Canvas.tsx's logic
        };
      }),
    })),
    on: jest.fn((event, handler) => {
      if (event === 'transformend') {
        transformerMockSingleton.onTransformEndCallback = handler;
      }
    }),
    off: jest.fn((event, handler) => {
      // Ensure the correct handler is removed.
      if (event === 'transformend' && transformerMockSingleton.onTransformEndCallback === handler) {
        transformerMockSingleton.onTransformEndCallback = null;
      }
    }),
  };
  
  // Assign the singleton to the container's 'current' property.
  // Tests will access it via mockedTransformerAPIContainer.current.
  mockedTransformerAPIContainer.current = transformerMockSingleton;

  return {
    // Keep Stage and Layer as simple divs for now, or use jest.requireActual if more functionality is needed
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
    Transformer: React.forwardRef<any, { onTransformEnd?: (e: any) => void }>(
      (props, ref) => {
        // When Canvas renders <Transformer ref={transformerRef} ... />, this mock receives the ref.
        // We assign our mock singleton to this ref so Canvas can interact with it.
        if (typeof ref === 'function') {
          ref(transformerMockSingleton);
        } else if (ref) {
          ref.current = transformerMockSingleton;
        }
        return <div data-testid="konva-transformer" {...props} />;
      }
    ),
    Line: ({ points, stroke, strokeWidth, ...props }: any) => <div data-testid="konva-line" {...props} />,
    // Ensure node mocks pass id and onClick/onTap for selection simulation
    Rect: ({ id, onClick, onTap, ...props }: any) => ( // Removed unused destructured props for brevity
      <div data-testid="konva-rect" id={id} onClick={onClick || onTap} {...props} />
    ),
    Circle: ({ id, onClick, onTap, ...props }: any) => (
      <div data-testid="konva-circle" id={id} onClick={onClick || onTap} {...props} />
    ),
    Text: ({ text, id, onClick, onTap, ...props }: any) => ( // Added id to Text mock
      <div data-testid="konva-text" id={id} onClick={onClick || onTap} {...props}>{text}</div>
    ),
  };
});

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
    // Reset the state of the transformer mock API before each test
    if (mockedTransformerAPIContainer.current) {
      mockedTransformerAPIContainer.current.nodes.mockClear();
      mockedTransformerAPIContainer.current.getLayer.mockClear(); // Clear this if it's a jest.fn()
      const stageMock = mockedTransformerAPIContainer.current.getStage();
      if (stageMock && stageMock.findOne && stageMock.findOne.mockClear) {
        stageMock.findOne.mockClear();
      }
      if (stageMock && stageMock.mockClear) { // If getStage itself is a jest.fn()
          stageMock.mockClear();
      }
      mockedTransformerAPIContainer.current.on.mockClear();
      mockedTransformerAPIContainer.current.off.mockClear();
      mockedTransformerAPIContainer.current.onTransformEndCallback = null;
    }
  });

  it('renders transformer component', () => {
    render(<Canvas {...defaultProps} />);
    
    const transformer = screen.getByTestId('konva-transformer');
    expect(transformer).toBeInTheDocument();
  });

  it('calls onNodeResize when a resizable node (rectangle) transform ends', () => {
    const onNodeResize = jest.fn();
    const testNodes: DiagramNode[] = [
      { id: 'rect-1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, selected: false },
      { id: 'text-1', type: 'text', x: 200, y: 200, text: 'NoResize', selected: false },
    ];

    render(
      <Canvas
        {...defaultProps}
        nodes={testNodes}
        onNodeResize={onNodeResize}
      />
    );

    const transformerAPI = mockedTransformerAPIContainer.current;
    expect(transformerAPI).toBeDefined();

    // 1. Simulate selecting the rectangle node
    // Use screen.getByTestId with a more specific query if multiple rects exist, or ensure only one.
    const rectNodeView = screen.getByTestId('konva-rect'); 
    expect(rectNodeView).toHaveAttribute('id', 'rect-1');
    fireEvent.click(rectNodeView);

    // 2. Verify Transformer's 'on' method was called to attach 'transformend'
    expect(transformerAPI.on).toHaveBeenCalledWith('transformend', expect.any(Function));
    expect(transformerAPI.onTransformEndCallback).toEqual(expect.any(Function));

    // 3. Simulate the transformend event
    const mockRectKonvaEvent = {
      target: {
        id: () => 'rect-1',
        x: () => 110, // New x
        y: () => 110, // New y
        scaleX: () => 1.5,
        scaleY: () => 1.2,
        width: () => 120, // Original width for calculation
        height: () => 80, // Original height for calculation
        attrs: { type: 'rectangle' },
        radius: () => undefined, // Not a circle
      },
    };

    if (transformerAPI.onTransformEndCallback) {
      transformerAPI.onTransformEndCallback(mockRectKonvaEvent);
    } else {
      throw new Error('onTransformEndCallback was not set on mock transformer');
    }

    // 4. Assert onNodeResize was called with correct arguments for rectangle
    expect(onNodeResize).toHaveBeenCalledTimes(1);
    expect(onNodeResize).toHaveBeenCalledWith('rect-1', {
      x: 110,
      y: 110,
      width: 120 * 1.5, // 180
      height: 80 * 1.2, // 96
    });

    // 5. Test that transformer is not attached/does not resize for text nodes
    onNodeResize.mockClear();
    transformerAPI.on.mockClear();
    transformerAPI.off.mockClear(); 
    transformerAPI.nodes.mockClear();
    
    // Simulate selecting the text node
    const textNodeView = screen.getByTestId('konva-text');
    expect(textNodeView).toHaveAttribute('id', 'text-1');
    fireEvent.click(textNodeView);

    // Transformer's `nodes` should be called with an empty array for text nodes
    expect(transformerAPI.nodes).toHaveBeenCalledWith([]);
    // `off` should have been called to detach previous listener for the rect node.
    expect(transformerAPI.off).toHaveBeenCalledWith('transformend', expect.any(Function));
    // `on` should NOT have been called again for 'transformend' after selecting text node,
    // as text nodes are not resizable.
    expect(transformerAPI.on).not.toHaveBeenCalled(); 
    
    expect(onNodeResize).not.toHaveBeenCalled();
  });
  
  it('calls onNodeResize when a resizable node (circle) transform ends', () => {
    const onNodeResize = jest.fn();
    const testNodes: DiagramNode[] = [
      { id: 'circle-1', type: 'circle', x: 300, y: 200, radius: 50, selected: false },
    ];

    render(
      <Canvas
        {...defaultProps}
        nodes={testNodes} 
        onNodeResize={onNodeResize}
      />
    );
    
    const transformerAPI = mockedTransformerAPIContainer.current;
    const circleNodeView = screen.getByTestId('konva-circle');
    expect(circleNodeView).toHaveAttribute('id', 'circle-1');
    fireEvent.click(circleNodeView);

    expect(transformerAPI.on).toHaveBeenCalledWith('transformend', expect.any(Function));
    expect(transformerAPI.onTransformEndCallback).toEqual(expect.any(Function));
    
    const mockCircleKonvaEvent = {
      target: {
        id: () => 'circle-1',
        x: () => 310,
        y: () => 210,
        scaleX: () => 1.2,
        scaleY: () => 1.2, // Circles usually scale uniformly
        width: () => 50 * 2, 
        height: () => 50 * 2,
        radius: () => 50, // Original radius
        attrs: { type: 'circle' },
      },
    };

    if (transformerAPI.onTransformEndCallback) {
      transformerAPI.onTransformEndCallback(mockCircleKonvaEvent);
    } else {
      throw new Error('onTransformEndCallback was not set on mock transformer');
    }

    expect(onNodeResize).toHaveBeenCalledTimes(1);
    expect(onNodeResize).toHaveBeenCalledWith('circle-1', {
      x: 310,
      y: 210,
      radius: 50 * 1.2, // 60
    });
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