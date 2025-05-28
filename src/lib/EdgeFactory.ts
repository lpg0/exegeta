import { Edge, EdgeDefaults } from '@/types/edges';
import { DiagramNode } from '@/types/nodes';
import { getBestConnectionPoints } from './EdgeUtils';

export class EdgeFactory {
  private static edgeCounter = 0;
  
  private static defaults: EdgeDefaults = {
    stroke: '#666666',
    strokeWidth: 2,
    strokeDashArray: undefined,
    label: undefined,
  };

  static generateId(): string {
    return `edge_${++this.edgeCounter}_${Date.now()}`;
  }

  static createEdge(
    sourceNode: DiagramNode,
    targetNode: DiagramNode,
    customProps?: Partial<Edge>
  ): Edge {
    const id = this.generateId();
    const connectionPoints = getBestConnectionPoints(sourceNode, targetNode);

    return {
      id,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourcePoint: connectionPoints.source,
      targetPoint: connectionPoints.target,
      selected: false,
      stroke: this.defaults.stroke,
      strokeWidth: this.defaults.strokeWidth,
      strokeDashArray: this.defaults.strokeDashArray,
      label: this.defaults.label,
      ...customProps,
    };
  }

  static updateEdgeConnectionPoints(
    edge: Edge,
    sourceNode: DiagramNode,
    targetNode: DiagramNode
  ): Edge {
    const connectionPoints = getBestConnectionPoints(sourceNode, targetNode);
    
    return {
      ...edge,
      sourcePoint: connectionPoints.source,
      targetPoint: connectionPoints.target,
    };
  }

  static updateDefaults(newDefaults: Partial<EdgeDefaults>): void {
    this.defaults = { ...this.defaults, ...newDefaults };
  }

  static getDefaults(): EdgeDefaults {
    return { ...this.defaults };
  }

  static createDashedEdge(
    sourceNode: DiagramNode,
    targetNode: DiagramNode,
    customProps?: Partial<Edge>
  ): Edge {
    return this.createEdge(sourceNode, targetNode, {
      strokeDashArray: [5, 5],
      ...customProps,
    });
  }

  static createThickEdge(
    sourceNode: DiagramNode,
    targetNode: DiagramNode,
    customProps?: Partial<Edge>
  ): Edge {
    return this.createEdge(sourceNode, targetNode, {
      strokeWidth: 4,
      ...customProps,
    });
  }

  static createLabeledEdge(
    sourceNode: DiagramNode,
    targetNode: DiagramNode,
    label: string,
    customProps?: Partial<Edge>
  ): Edge {
    return this.createEdge(sourceNode, targetNode, {
      label,
      ...customProps,
    });
  }
} 