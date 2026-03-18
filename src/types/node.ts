import type { Position, Size } from './geometry';
import type { Color } from './style';

export type NodeId = string;
export enum NodeType {
  Rect = 'rect',
  Circle = 'circle',
  Image = 'image',
  Svg = 'svg',
  Group = 'group',
  Polygon = 'polygon',
}
export type PolygonPoint = {
  x: number;
  y: number;
};

type BaseNode<T extends NodeType> = {
  id: NodeId;
  type: T;
  name: string;
  rotation: number; // 0, 90, 180, 270
  opacity?: number;
  locked?: boolean;
} & Color &
  Size &
  Position;

export type RectNode = BaseNode<NodeType.Rect>;
type CircleNode = BaseNode<NodeType.Circle>;
export type ImageNode = Omit<BaseNode<NodeType.Image>, 'fill' | 'stroke'> & {
  url: string;
};

export type PolygonNode = BaseNode<NodeType.Polygon> & {
  points: PolygonPoint[];
  strokeWidth: number;
};

export type SvgNode = BaseNode<NodeType.Svg> & {
  url: string;
};

export type GroupNode = BaseNode<NodeType.Group> & {
  children: CanvasNode[];
  visible?: boolean;
};

export type CanvasNode =
  | RectNode
  | CircleNode
  | PolygonNode
  | ImageNode
  | SvgNode
  | GroupNode;
