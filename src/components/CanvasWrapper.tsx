'use client';

import dynamic from 'next/dynamic';
import { CanvasProps } from '@/types/canvas';
import { DiagramNode } from '@/types/nodes';
import { Edge, EdgeCreationMode, EdgeCreationState } from '@/types/edges';

interface CanvasWrapperProps extends CanvasProps {
  nodes?: DiagramNode[];
  edges?: Edge[];
  edgeCreationMode?: EdgeCreationMode;
  onNodeSelect?: (nodeId: string) => void;
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void;
  onNodeResize?: (nodeId: string, width: number, height?: number) => void;
  onNodeTextChange?: (nodeId: string, newText: string) => void;
  onEdgeSelect?: (edgeId: string) => void;
  onEdgeCreationStateChange?: (state: EdgeCreationState) => void;
  onStageClick?: (x: number, y: number) => void;
}

// Dynamically import Canvas component with no SSR
const Canvas = dynamic(() => import('./Canvas'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading canvas...</div>
    </div>
  ),
});

export default function CanvasWrapper(props: CanvasWrapperProps) {
  return <Canvas {...props} />;
} 