import React from 'react';
import { Line, Text, Arrow } from 'react-konva';
import { Edge as EdgeType } from '@/types/edges';
import Konva from 'konva';

interface EdgeProps {
  edge: EdgeType;
  onSelect?: (edgeId: string) => void;
  showArrowhead?: boolean;
}

const Edge: React.FC<EdgeProps> = ({ edge, onSelect, showArrowhead = true }) => {
  const handleClick = () => {
    onSelect?.(edge.id);
  };

  // Calculate midpoint for label placement
  const midX = (edge.sourcePoint.x + edge.targetPoint.x) / 2;
  const midY = (edge.sourcePoint.y + edge.targetPoint.y) / 2;

  return (
    <>
      {/* Main edge line */}
      {showArrowhead ? (
        <Arrow
          id={edge.id}
          points={[edge.sourcePoint.x, edge.sourcePoint.y, edge.targetPoint.x, edge.targetPoint.y]}
          stroke={edge.selected ? '#007bff' : (edge.stroke || '#666666')}
          strokeWidth={edge.selected ? (edge.strokeWidth || 2) + 1 : (edge.strokeWidth || 2)}
          dash={edge.strokeDashArray}
          fill={edge.selected ? '#007bff' : (edge.stroke || '#666666')}
          pointerLength={8}
          pointerWidth={6}
          onClick={handleClick}
          onTap={handleClick}
        />
      ) : (
        <Line
          id={edge.id}
          points={[edge.sourcePoint.x, edge.sourcePoint.y, edge.targetPoint.x, edge.targetPoint.y]}
          stroke={edge.selected ? '#007bff' : (edge.stroke || '#666666')}
          strokeWidth={edge.selected ? (edge.strokeWidth || 2) + 1 : (edge.strokeWidth || 2)}
          dash={edge.strokeDashArray}
          onClick={handleClick}
          onTap={handleClick}
        />
      )}

      {/* Edge label */}
      {edge.label && (
        <Text
          x={midX - 20} // Offset to center the text
          y={midY - 8}
          text={edge.label}
          fontSize={12}
          fontFamily="Arial"
          fill="#333333"
          align="center"
          width={40}
          onClick={handleClick}
          onTap={handleClick}
        />
      )}
    </>
  );
};

export default Edge; 