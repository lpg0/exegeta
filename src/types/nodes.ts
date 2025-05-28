export type NodeType = 'text' | 'rectangle' | 'circle';

export interface BaseNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  selected?: boolean;
}

export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  width?: number;
  height?: number;
}

export interface RectangleNode extends BaseNode {
  type: 'rectangle';
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface CircleNode extends BaseNode {
  type: 'circle';
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type DiagramNode = TextNode | RectangleNode | CircleNode;

export interface NodeDefaults {
  text: Omit<TextNode, 'id' | 'x' | 'y'>;
  rectangle: Omit<RectangleNode, 'id' | 'x' | 'y'>;
  circle: Omit<CircleNode, 'id' | 'x' | 'y'>;
}

export interface NodeFactoryConfig {
  defaults: NodeDefaults;
} 