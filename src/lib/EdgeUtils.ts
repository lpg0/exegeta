import { DiagramNode, TextNode, RectangleNode, CircleNode } from '@/types/nodes';
import { NodeConnectionPoints, EdgeConnectionPoint } from '@/types/edges';

/**
 * Calculate connection points for a given node
 */
export function getNodeConnectionPoints(node: DiagramNode): NodeConnectionPoints {
  switch (node.type) {
    case 'text':
      return getTextNodeConnectionPoints(node);
    case 'rectangle':
      return getRectangleNodeConnectionPoints(node);
    case 'circle':
      return getCircleNodeConnectionPoints(node);
    default:
      throw new Error(`Unknown node type: ${(node as any).type}`);
  }
}

function getTextNodeConnectionPoints(node: TextNode): NodeConnectionPoints {
  const width = node.width || 100;
  const height = node.height || 20;
  const centerX = node.x + width / 2;
  const centerY = node.y + height / 2;

  return {
    nodeId: node.id,
    top: { x: centerX, y: node.y },
    bottom: { x: centerX, y: node.y + height },
    left: { x: node.x, y: centerY },
    right: { x: node.x + width, y: centerY },
  };
}

function getRectangleNodeConnectionPoints(node: RectangleNode): NodeConnectionPoints {
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;

  return {
    nodeId: node.id,
    top: { x: centerX, y: node.y },
    bottom: { x: centerX, y: node.y + node.height },
    left: { x: node.x, y: centerY },
    right: { x: node.x + node.width, y: centerY },
  };
}

function getCircleNodeConnectionPoints(node: CircleNode): NodeConnectionPoints {
  return {
    nodeId: node.id,
    top: { x: node.x, y: node.y - node.radius },
    bottom: { x: node.x, y: node.y + node.radius },
    left: { x: node.x - node.radius, y: node.y },
    right: { x: node.x + node.radius, y: node.y },
  };
}

/**
 * Find the best connection points between two nodes
 */
export function getBestConnectionPoints(
  sourceNode: DiagramNode,
  targetNode: DiagramNode
): { source: EdgeConnectionPoint; target: EdgeConnectionPoint } {
  const sourcePoints = getNodeConnectionPoints(sourceNode);
  const targetPoints = getNodeConnectionPoints(targetNode);

  // Calculate distances between all possible connection point combinations
  let minDistance = Infinity;
  let bestSource: EdgeConnectionPoint = { ...sourcePoints.right, side: 'right' };
  let bestTarget: EdgeConnectionPoint = { ...targetPoints.left, side: 'left' };

  const sourceOptions: Array<{ point: { x: number; y: number }; side: 'top' | 'bottom' | 'left' | 'right' }> = [
    { point: sourcePoints.top, side: 'top' },
    { point: sourcePoints.bottom, side: 'bottom' },
    { point: sourcePoints.left, side: 'left' },
    { point: sourcePoints.right, side: 'right' },
  ];

  const targetOptions: Array<{ point: { x: number; y: number }; side: 'top' | 'bottom' | 'left' | 'right' }> = [
    { point: targetPoints.top, side: 'top' },
    { point: targetPoints.bottom, side: 'bottom' },
    { point: targetPoints.left, side: 'left' },
    { point: targetPoints.right, side: 'right' },
  ];

  for (const source of sourceOptions) {
    for (const target of targetOptions) {
      const distance = Math.sqrt(
        Math.pow(target.point.x - source.point.x, 2) + 
        Math.pow(target.point.y - source.point.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        bestSource = { ...source.point, side: source.side };
        bestTarget = { ...target.point, side: target.side };
      }
    }
  }

  return { source: bestSource, target: bestTarget };
}

/**
 * Calculate the angle between two points in degrees
 */
export function calculateAngle(from: { x: number; y: number }, to: { x: number; y: number }): number {
  return Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(from: { x: number; y: number }, to: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
} 