import React from 'react';
import { Circle } from 'react-konva';
import { CircleNode as CircleNodeType } from '@/types/nodes';
import Konva from 'konva';

interface CircleNodeProps {
  node: CircleNodeType;
  onSelect?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
}

const CircleNode: React.FC<CircleNodeProps> = ({ node, onSelect, onDragEnd }) => {
  const handleClick = () => {
    onSelect?.(node.id);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd?.(node.id, e.target.x(), e.target.y());
  };

  return (
    <Circle
      id={node.id}
      x={node.x}
      y={node.y}
      radius={node.radius}
      fill={node.fill || '#ffffff'}
      stroke={node.selected ? '#007bff' : (node.stroke || '#000000')}
      strokeWidth={node.selected ? 3 : (node.strokeWidth || 1)}
      draggable
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
    />
  );
};

export default CircleNode; 