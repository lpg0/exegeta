import { DiagramNode, NodeType, TextNode, RectangleNode, CircleNode, NodeDefaults } from '@/types/nodes';

export class NodeFactory {
  private static nodeCounter = 0;
  
  private static defaults: NodeDefaults = {
    text: {
      type: 'text',
      text: 'New Text',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#000000',
      width: 100,
      height: 20,
    },
    rectangle: {
      type: 'rectangle',
      width: 100,
      height: 60,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
      cornerRadius: 0,
    },
    circle: {
      type: 'circle',
      radius: 30,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
    },
  };

  static generateId(): string {
    return `node_${++this.nodeCounter}_${Date.now()}`;
  }

  static createNode(type: NodeType, x: number, y: number, customProps?: Partial<DiagramNode>): DiagramNode {
    const id = this.generateId();
    const baseProps = { id, x, y, selected: false };

    switch (type) {
      case 'text':
        return {
          ...baseProps,
          ...this.defaults.text,
          ...customProps,
        } as TextNode;

      case 'rectangle':
        return {
          ...baseProps,
          ...this.defaults.rectangle,
          ...customProps,
        } as RectangleNode;

      case 'circle':
        return {
          ...baseProps,
          ...this.defaults.circle,
          ...customProps,
        } as CircleNode;

      default:
        throw new Error(`Unknown node type: ${type}`);
    }
  }

  static createTextNode(x: number, y: number, text?: string): TextNode {
    return this.createNode('text', x, y, { text: text || 'New Text' }) as TextNode;
  }

  static createRectangleNode(x: number, y: number, width?: number, height?: number): RectangleNode {
    return this.createNode('rectangle', x, y, { width: width || 100, height: height || 60 }) as RectangleNode;
  }

  static createCircleNode(x: number, y: number, radius?: number): CircleNode {
    return this.createNode('circle', x, y, { radius: radius || 30 }) as CircleNode;
  }

  static updateDefaults(newDefaults: Partial<NodeDefaults>): void {
    this.defaults = { ...this.defaults, ...newDefaults };
  }

  static getDefaults(): NodeDefaults {
    return { ...this.defaults };
  }
} 