import React from 'react';
import { DiagramNode } from '@/types/nodes';
import TextNode from './TextNode';
import RectangleNode from './RectangleNode';
import CircleNode from './CircleNode';

interface NodeRendererProps {
  node: DiagramNode;
  onSelect?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
  onTextChange?: (nodeId: string, newText: string) => void;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({ node, onSelect, onDragEnd, onTextChange }) => {
  switch (node.type) {
    case 'text':
      return <TextNode node={node} onSelect={onSelect} onDragEnd={onDragEnd} onTextChange={onTextChange} />;
    
    case 'rectangle':
      return <RectangleNode node={node} onSelect={onSelect} onDragEnd={onDragEnd} />;
    
    case 'circle':
      return <CircleNode node={node} onSelect={onSelect} onDragEnd={onDragEnd} />;
    
    default:
      console.warn('Unknown node type:', (node as any).type);
      return null;
  }
};

export default NodeRenderer; 