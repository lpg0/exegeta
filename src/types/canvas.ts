import Konva from 'konva';

export interface CanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

export interface StageConfig {
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  x?: number;
  y?: number;
}

export interface ZoomConfig {
  scaleBy: number;
  minScale: number;
  maxScale: number;
}

export interface CanvasRef {
  stage: Konva.Stage | null;
  resetZoom: () => void;
  centerView: () => void;
} 