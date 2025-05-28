import { DiagramNode } from './nodes';

export interface Edge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePoint: { x: number; y: number };
  targetPoint: { x: number; y: number };
  selected?: boolean;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  label?: string;
}

export interface EdgeDefaults {
  stroke: string;
  strokeWidth: number;
  strokeDashArray?: number[];
  label?: string;
}

export interface EdgeCreationState {
  isCreating: boolean;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  tempEdge: Partial<Edge> | null;
}

export interface EdgeConnectionPoint {
  x: number;
  y: number;
  side: 'top' | 'bottom' | 'left' | 'right';
}

export type EdgeCreationMode = 'none' | 'creating' | 'selecting-source' | 'selecting-target';

export interface NodeConnectionPoints {
  nodeId: string;
  top: { x: number; y: number };
  bottom: { x: number; y: number };
  left: { x: number; y: number };
  right: { x: number; y: number };
} 