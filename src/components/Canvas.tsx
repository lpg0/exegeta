'use client';

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Line, Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasProps, CanvasRef, ZoomConfig } from '@/types/canvas';
import { DiagramNode } from '@/types/nodes';
import { Edge, EdgeCreationMode, EdgeCreationState } from '@/types/edges';
import { NodeRenderer } from './nodes';
import { EdgeRenderer } from './edges';

const ZOOM_CONFIG: ZoomConfig = {
  scaleBy: 1.1,
  minScale: 0.1,
  maxScale: 5,
};

interface CanvasWithNodesProps extends CanvasProps {
  nodes?: DiagramNode[];
  edges?: Edge[];
  edgeCreationMode?: EdgeCreationMode;
  onNodeSelect?: (nodeId: string) => void;
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void;
  onNodeResize?: (nodeId: string, width: number, height?: number) => void;
  onEdgeSelect?: (edgeId: string) => void;
  onEdgeCreationStateChange?: (state: EdgeCreationState) => void;
  onStageClick?: (x: number, y: number) => void;
}

const Canvas = forwardRef<CanvasRef, CanvasWithNodesProps>(({ 
  width = 800, 
  height = 600, 
  className = '',
  nodes = [],
  edges = [],
  edgeCreationMode = 'none',
  onNodeSelect,
  onNodeDragEnd,
  onNodeResize,
  onEdgeSelect,
  onEdgeCreationStateChange,
  onStageClick,
}, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [stageConfig, setStageConfig] = useState({
    width,
    height,
    scaleX: 1,
    scaleY: 1,
    x: 0,
    y: 0,
  });

  const [edgeCreationState, setEdgeCreationState] = useState<EdgeCreationState>({
    isCreating: false,
    sourceNodeId: null,
    targetNodeId: null,
    tempEdge: null,
  });

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    stage: stageRef.current,
    resetZoom: () => {
      setStageConfig(prev => ({
        ...prev,
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      }));
    },
    centerView: () => {
      setStageConfig(prev => ({
        ...prev,
        x: 0,
        y: 0,
      }));
    },
  }));

  // Handle edge creation state changes
  useEffect(() => {
    if (edgeCreationMode === 'none') {
      setEdgeCreationState({
        isCreating: false,
        sourceNodeId: null,
        targetNodeId: null,
        tempEdge: null,
      });
    } else if (edgeCreationMode === 'creating') {
      setEdgeCreationState(prev => ({
        ...prev,
        isCreating: true,
      }));
    }
  }, [edgeCreationMode]);

  // Notify parent of edge creation state changes
  useEffect(() => {
    onEdgeCreationStateChange?.(edgeCreationState);
  }, [edgeCreationState, onEdgeCreationStateChange]);

  // Handle wheel zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let direction = e.evt.deltaY > 0 ? -1 : 1;
    
    // For trackpad, use smaller increments
    if (e.evt.ctrlKey) {
      direction = e.evt.deltaY > 0 ? -1 : 1;
    }

    const newScale = direction > 0 
      ? oldScale * ZOOM_CONFIG.scaleBy 
      : oldScale / ZOOM_CONFIG.scaleBy;

    // Clamp the scale
    const clampedScale = Math.max(
      ZOOM_CONFIG.minScale,
      Math.min(ZOOM_CONFIG.maxScale, newScale)
    );

    setStageConfig({
      width: stageConfig.width,
      height: stageConfig.height,
      scaleX: clampedScale,
      scaleY: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  // Handle drag for panning
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Only update stage position if the stage itself was dragged, not a child node
    if (e.target === e.target.getStage()) {
      setStageConfig(prev => ({
        ...prev,
        x: e.target.x(),
        y: e.target.y(),
      }));
    }
  };

  // Handle node clicks - for selection and edge creation
  const handleNodeSelect = (nodeId: string) => {
    if (edgeCreationMode === 'creating') {
      if (!edgeCreationState.sourceNodeId) {
        // Select source node
        setEdgeCreationState(prev => ({
          ...prev,
          sourceNodeId: nodeId,
        }));
      } else if (edgeCreationState.sourceNodeId !== nodeId) {
        // Select target node and complete edge creation
        setEdgeCreationState(prev => ({
          ...prev,
          targetNodeId: nodeId,
        }));
      }
    } else {
      // Normal node selection
      setSelectedNode(nodeId);
      onNodeSelect?.(nodeId);
    }
  };

  // Handle stage click (for deselecting nodes or canceling edge creation)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only trigger if clicking on the stage itself, not on a node or edge
    if (e.target === e.target.getStage()) {
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Convert screen coordinates to canvas coordinates
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const pos = transform.point(pointer);

      if (edgeCreationMode === 'creating') {
        // Cancel edge creation
        setEdgeCreationState({
          isCreating: false,
          sourceNodeId: null,
          targetNodeId: null,
          tempEdge: null,
        });
      } else {
        // Deselect nodes
        setSelectedNode(null);
        onStageClick?.(pos.x, pos.y);
      }
    }
  };

  // Attach transformer to selected node
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    
    if (!transformer || !stage) return;

    if (selectedNode) {
      // Find the selected node in the stage
      const nodeShape = stage.findOne(`#${selectedNode}`);
      
      if (nodeShape) {
        // Check if the node is resizable (not a text node)
        const nodeData = nodes.find(n => n.id === selectedNode);
        const isResizable = nodeData && nodeData.type !== 'text';
        
        if (isResizable) {
          transformer.nodes([nodeShape]);
          transformer.getLayer()?.batchDraw();
        } else {
          // For text nodes, clear the transformer
          transformer.nodes([]);
          transformer.getLayer()?.batchDraw();
        }
      }
    } else {
      // Clear transformer
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedNode, nodes]);

  // Handle transformer resize events
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const nodeId = node.id();
    
    if (!nodeId || !onNodeResize) return;

    const nodeData = nodes.find(n => n.id === nodeId);
    if (!nodeData) return;

    if (nodeData.type === 'rectangle') {
      const rectNode = node as Konva.Rect;
      const scaleX = rectNode.scaleX();
      const scaleY = rectNode.scaleY();
      const newWidth = Math.max(5, rectNode.width() * scaleX);
      const newHeight = Math.max(5, rectNode.height() * scaleY);
      
      // Reset scale and update size
      rectNode.scaleX(1);
      rectNode.scaleY(1);
      rectNode.width(newWidth);
      rectNode.height(newHeight);
      
      onNodeResize(nodeId, newWidth, newHeight);
    } else if (nodeData.type === 'circle') {
      const circleNode = node as Konva.Circle;
      const scaleX = circleNode.scaleX();
      const scaleY = circleNode.scaleY();
      const averageScale = (scaleX + scaleY) / 2;
      const newRadius = Math.max(5, circleNode.radius() * averageScale);
      
      // Reset scale and update radius
      circleNode.scaleX(1);
      circleNode.scaleY(1);
      circleNode.radius(newRadius);
      
      onNodeResize(nodeId, newRadius * 2, newRadius * 2); // Width/height for consistency
    }
  };

  // Update stage config when props change
  useEffect(() => {
    setStageConfig(prev => ({
      ...prev,
      width,
      height,
    }));
  }, [width, height]);

  return (
    <div className={`bg-gray-50 border border-gray-200 ${className}`}>
      <Stage
        ref={stageRef}
        width={stageConfig.width}
        height={stageConfig.height}
        scaleX={stageConfig.scaleX}
        scaleY={stageConfig.scaleY}
        x={stageConfig.x}
        y={stageConfig.y}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onMouseDown={handleStageClick}
        draggable={edgeCreationMode === 'none'} // Disable dragging when creating edges
      >
        <Layer>
          {/* Grid background - visual helper */}
          <Grid
            width={stageConfig.width}
            height={stageConfig.height}
            scale={stageConfig.scaleX}
            offsetX={stageConfig.x}
            offsetY={stageConfig.y}
          />
          
          {/* Render edges first (behind nodes) */}
          <EdgeRenderer
            edges={edges}
            onEdgeSelect={onEdgeSelect}
          />
          
          {/* Render nodes */}
          {nodes.map((node) => (
            <NodeRenderer
              key={node.id}
              node={{
                ...node,
                // Highlight nodes during edge creation
                selected: edgeCreationMode === 'creating' 
                  ? (node.selected || node.id === edgeCreationState.sourceNodeId)
                  : node.selected
              }}
              onSelect={handleNodeSelect}
              onDragEnd={onNodeDragEnd}
            />
          ))}

          {/* Transformer for resizing selected nodes */}
          <Transformer
            ref={transformerRef}
            onTransformEnd={handleTransformEnd}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            keepRatio={false}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'top-center',
              'bottom-center',
              'middle-left',
              'middle-right'
            ]}
          />

          {/* Edge creation mode indicator */}
          {edgeCreationMode === 'creating' && edgeCreationState.sourceNodeId && (
            <Line
              points={[0, 0, 0, 0]} // Will be updated with mouse position
              stroke="#007bff"
              strokeWidth={2}
              dash={[5, 5]}
              opacity={0.7}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
});

// Grid component for visual reference
const Grid: React.FC<{
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}> = ({ width, height, scale, offsetX, offsetY }) => {
  const lines = [];
  const gridSize = 20;
  
  // Only render grid if zoom level is reasonable
  if (scale < 0.5) return null;

  // Vertical lines
  for (let i = 0; i < width / gridSize + 2; i++) {
    const x = i * gridSize - (offsetX % gridSize);
    lines.push(
      <Line
        key={`v-${i}`}
        points={[x, 0, x, height]}
        stroke="#e5e7eb"
        strokeWidth={0.5}
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i < height / gridSize + 2; i++) {
    const y = i * gridSize - (offsetY % gridSize);
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, y, width, y]}
        stroke="#e5e7eb"
        strokeWidth={0.5}
      />
    );
  }

  return <>{lines}</>;
};

Canvas.displayName = 'Canvas';

export default Canvas; 