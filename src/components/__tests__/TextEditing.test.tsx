import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Stage, Layer } from 'react-konva';
import TextNode from '../nodes/TextNode';
import { TextNode as TextNodeType } from '@/types/nodes';

// Mock Konva components
jest.mock('react-konva', () => {
  const mockTextRef = {
    getStage: jest.fn(() => ({
      container: jest.fn(() => ({
        getBoundingClientRect: jest.fn(() => ({
          left: 100,
          top: 100,
          width: 800,
          height: 600
        }))
      })),
      scaleX: jest.fn(() => 1)
    })),
    getAbsolutePosition: jest.fn(() => ({ x: 50, y: 50 })),
    width: jest.fn(() => 100),
    height: jest.fn(() => 20),
    draggable: jest.fn()
  };

  return {
    Stage: ({ children, ...props }: any) => <div data-testid="konva-stage" {...props}>{children}</div>,
    Layer: ({ children, ...props }: any) => <div data-testid="konva-layer" {...props}>{children}</div>,
    Text: React.forwardRef<any, any>(({ onClick, onDblClick, onDragEnd, onTap, ...props }, ref) => {
      // Simulate ref assignment
      React.useEffect(() => {
        if (ref && typeof ref === 'object') {
          ref.current = mockTextRef;
        }
      }, [ref]);

      return (
        <div
          data-testid="konva-text"
          onClick={onClick}
          onDoubleClick={onDblClick}
          onDragEnd={onDragEnd}
          {...props}
        >
          {props.text}
        </div>
      );
    })
  };
});

describe('TextNode Text Editing', () => {
  const mockNode: TextNodeType = {
    id: 'text-1',
    type: 'text',
    x: 50,
    y: 50,
    text: 'Hello World',
    fontSize: 16,
    fontFamily: 'Arial',
    fill: '#000000',
    width: 100,
    height: 20
  };

  const mockProps = {
    node: mockNode,
    onSelect: jest.fn(),
    onDragEnd: jest.fn(),
    onTextChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clean up any existing textareas
    document.querySelectorAll('textarea').forEach(textarea => {
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    });
  });

  afterEach(() => {
    // Clean up any textareas created during tests
    document.querySelectorAll('textarea').forEach(textarea => {
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    });
  });

  it('renders text node correctly', () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveTextContent('Hello World');
  });

  it('calls onSelect when single clicked', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.click(textElement);

    // Wait for the single click timeout
    await waitFor(() => {
      expect(mockProps.onSelect).toHaveBeenCalledWith('text-1');
    }, { timeout: 300 });
  });

  it('enters edit mode on double click', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    // Wait for textarea to be created
    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('Hello World');
    });
  });

  it('applies correct styling to textarea in edit mode', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      
      const styles = window.getComputedStyle(textarea);
      expect(textarea.style.position).toBe('fixed');
      expect(textarea.style.fontSize).toBe('16px');
      expect(textarea.style.fontFamily).toBe('Arial');
      expect(textarea.style.color).toBe('rgb(0, 0, 0)');
      expect(textarea.style.border).toBe('2px solid rgb(0, 123, 255)');
    });
  });

  it('commits text change on Enter key', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    // Change the text
    fireEvent.change(textarea, { target: { value: 'Updated Text' } });
    
    // Press Enter to commit
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockProps.onTextChange).toHaveBeenCalledWith('text-1', 'Updated Text');
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });
  });

  it('cancels edit on Escape key', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    // Change the text
    fireEvent.change(textarea, { target: { value: 'Updated Text' } });
    
    // Press Escape to cancel
    fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(mockProps.onTextChange).not.toHaveBeenCalled();
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });
  });

  it('commits text change on blur', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    // Change the text
    fireEvent.change(textarea, { target: { value: 'Blurred Text' } });
    
    // Trigger blur
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(mockProps.onTextChange).toHaveBeenCalledWith('text-1', 'Blurred Text');
    }, { timeout: 200 });
  });

  it('allows Shift+Enter for new lines without committing', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    // Press Shift+Enter (should not commit)
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });

    // Should still be in edit mode
    expect(document.querySelector('textarea')).toBeInTheDocument();
    expect(mockProps.onTextChange).not.toHaveBeenCalled();
  });

  it('does not call onTextChange if text is unchanged', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    // Don't change the text, just commit
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockProps.onTextChange).not.toHaveBeenCalled();
      expect(document.querySelector('textarea')).not.toBeInTheDocument();
    });
  });

  it('prevents single click action when in edit mode', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    
    // Enter edit mode
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    // Try to click while in edit mode
    fireEvent.click(textElement);

    // Wait longer than the single click timeout
    await new Promise(resolve => setTimeout(resolve, 300));

    // onSelect should not be called
    expect(mockProps.onSelect).not.toHaveBeenCalled();
  });

  it('cleans up textarea on component unmount', async () => {
    const { unmount } = render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    // Unmount the component
    unmount();

    // Textarea should be cleaned up
    expect(document.querySelector('textarea')).not.toBeInTheDocument();
  });

  it('handles multiple rapid double clicks gracefully', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    
    // Rapid double clicks
    fireEvent.doubleClick(textElement);
    fireEvent.doubleClick(textElement);
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textareas = document.querySelectorAll('textarea');
      expect(textareas).toHaveLength(1); // Should only have one textarea
    });
  });

  it('focuses and selects text in textarea when entering edit mode', async () => {
    render(
      <Stage width={800} height={600}>
        <Layer>
          <TextNode {...mockProps} />
        </Layer>
      </Stage>
    );

    const textElement = screen.getByTestId('konva-text');
    fireEvent.doubleClick(textElement);

    await waitFor(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      expect(document.activeElement).toBe(textarea);
    });
  });
}); 