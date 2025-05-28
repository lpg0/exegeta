import React from 'react';
import { Rect } from 'react-konva';
import { RectangleNode as RectangleNodeType } from '@/types/nodes';
import Konva from 'konva';

interface RectangleNodeProps {
  node: RectangleNodeType;
  onSelect?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
}

const RectangleNode: React.FC<RectangleNodeProps> = ({ node, onSelect, onDragEnd }) => {
  const handleClick = () => {
    onSelect?.(node.id);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd?.(node.id, e.target.x(), e.target.y());
  };

  return (
    <Rect
      id={node.id}
      x={node.x}
      y={node.y}
      width={node.width}
      height={node.height}
      fill={node.fill || '#ffffff'}
      stroke={node.selected ? '#007bff' : (node.stroke || '#000000')}
      strokeWidth={node.selected ? 3 : (node.strokeWidth || 1)}
      cornerRadius={node.cornerRadius || 0}
      draggable
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
    />
  );
};

export default RectangleNode; 