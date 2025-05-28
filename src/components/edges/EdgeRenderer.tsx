import React from 'react';
import { Edge as EdgeType } from '@/types/edges';
import Edge from './Edge';

interface EdgeRendererProps {
  edges: EdgeType[];
  onEdgeSelect?: (edgeId: string) => void;
  showArrowheads?: boolean;
}

const EdgeRenderer: React.FC<EdgeRendererProps> = ({ 
  edges, 
  onEdgeSelect, 
  showArrowheads = true 
}) => {
  return (
    <>
      {edges.map((edge) => (
        <Edge
          key={edge.id}
          edge={edge}
          onSelect={onEdgeSelect}
          showArrowhead={showArrowheads}
        />
      ))}
    </>
  );
};

export default EdgeRenderer; 