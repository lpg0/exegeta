import React from 'react';
import { Text } from 'react-konva';
import { TextNode as TextNodeType } from '@/types/nodes';
import Konva from 'konva';

interface TextNodeProps {
  node: TextNodeType;
  onSelect?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
}

const TextNode: React.FC<TextNodeProps> = ({ node, onSelect, onDragEnd }) => {
  const handleClick = () => {
    onSelect?.(node.id);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd?.(node.id, e.target.x(), e.target.y());
  };

  return (
    <Text
      id={node.id}
      x={node.x}
      y={node.y}
      text={node.text}
      fontSize={node.fontSize || 16}
      fontFamily={node.fontFamily || 'Arial'}
      fill={node.fill || '#000000'}
      width={node.width}
      height={node.height}
      draggable
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
      stroke={node.selected ? '#007bff' : undefined}
      strokeWidth={node.selected ? 2 : 0}
    />
  );
};

export default TextNode; 