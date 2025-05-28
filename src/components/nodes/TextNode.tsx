import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Text } from 'react-konva';
import { TextNode as TextNodeType } from '@/types/nodes';
import Konva from 'konva';

interface TextNodeProps {
  node: TextNodeType;
  onSelect?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
  onTextChange?: (nodeId: string, newText: string) => void;
}

const TextNode: React.FC<TextNodeProps> = ({ node, onSelect, onDragEnd, onTextChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<Konva.Text>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement | null>(null);

  const handleClick = useCallback(() => {
    console.log(`TextNode ${node.id}: Single click detected, isEditing:`, isEditing);
    if (isEditing) return;
    
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    // Set a timeout for single click action
    clickTimeoutRef.current = setTimeout(() => {
      console.log(`TextNode ${node.id}: Processing single click`);
      onSelect?.(node.id);
    }, 200);
  }, [node.id, isEditing, onSelect]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    console.log(`TextNode ${node.id}: Drag end detected`);
    if (isEditing) return;
    onDragEnd?.(node.id, e.target.x(), e.target.y());
  }, [node.id, isEditing, onDragEnd]);

  const createTextArea = useCallback(() => {
    const textNode = textRef.current;
    if (!textNode) return null;

    const stage = textNode.getStage();
    const container = stage?.container();
    
    if (!stage || !container) return null;

    // Get the bounding rect of the canvas container
    const containerRect = container.getBoundingClientRect();
    
    // Get the absolute position of the text node
    const absPos = textNode.getAbsolutePosition();
    const scale = stage.scaleX();
    
    // Calculate the actual position relative to the page
    const x = containerRect.left + absPos.x * scale;
    const y = containerRect.top + absPos.y * scale;
    
    const width = (node.width || textNode.width() || 100) * scale;
    const height = (node.height || textNode.height() || 20) * scale;

    // Create textarea element
    const textarea = document.createElement('textarea');
    textarea.value = node.text;
    textarea.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      font-size: ${(node.fontSize || 16) * scale}px;
      font-family: ${node.fontFamily || 'Arial'};
      color: ${node.fill || '#000000'};
      border: 2px solid #007bff;
      padding: 2px;
      margin: 0px;
      overflow: hidden;
      background: white;
      outline: none;
      resize: none;
      line-height: 1.2;
      z-index: 1000;
      white-space: pre-wrap;
      word-break: break-word;
      box-sizing: border-box;
    `;

    // Add event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commitTextChange();
      }
      if (e.key === 'Escape') {
        cancelEdit();
      }
    };

    const handleBlur = () => {
      // Small delay to prevent immediate blur
      setTimeout(() => {
        if (document.body.contains(textarea)) {
          commitTextChange();
        }
      }, 100);
    };

    const commitTextChange = () => {
      const newText = textarea.value;
      if (onTextChange && newText !== node.text) {
        onTextChange(node.id, newText);
      }
      cleanupTextArea();
    };

    const cancelEdit = () => {
      cleanupTextArea();
    };

    const cleanupTextArea = () => {
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
      textAreaElementRef.current = null;
      setIsEditing(false);
      if (textRef.current) {
        textRef.current.draggable(true);
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('blur', handleBlur);

    // Store reference for cleanup
    textAreaElementRef.current = textarea;

    return textarea;
  }, [node, onTextChange]);

  const handleDoubleClick = useCallback(() => {
    console.log(`TextNode ${node.id}: Double click detected, starting edit mode`);
    
    // Clear single click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    // Clean up any existing textarea
    if (textAreaElementRef.current) {
      if (textAreaElementRef.current.parentNode) {
        textAreaElementRef.current.parentNode.removeChild(textAreaElementRef.current);
      }
      textAreaElementRef.current = null;
    }
    
    setIsEditing(true);
    
    // Disable dragging
    if (textRef.current) {
      textRef.current.draggable(false);
    }
    
    // Create and show textarea
    const textarea = createTextArea();
    if (textarea) {
      document.body.appendChild(textarea);
      
      // Focus and select after a brief delay
      setTimeout(() => {
        textarea.focus();
        textarea.select();
      }, 10);
    }
  }, [node.id, createTextArea]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (textAreaElementRef.current && textAreaElementRef.current.parentNode) {
        textAreaElementRef.current.parentNode.removeChild(textAreaElementRef.current);
      }
    };
  }, []);

  return (
    <Text
      ref={textRef}
      id={node.id}
      x={node.x}
      y={node.y}
      text={node.text}
      fontSize={node.fontSize || 16}
      fontFamily={node.fontFamily || 'Arial'}
      fill={node.fill || '#000000'}
      width={node.width}
      height={node.height}
      draggable={!isEditing}
      opacity={isEditing ? 0.3 : 1}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDoubleClick}
      onDragEnd={handleDragEnd}
      stroke={node.selected ? '#007bff' : undefined}
      strokeWidth={node.selected ? 2 : 0}
      listening={!isEditing}
    />
  );
};

export default TextNode; 