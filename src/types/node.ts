import type { Position, Size } from './geometry';
import type { Color } from './style';

export type NodeId = string;

export type PolygonPoint = {
  x: number;
  y: number;
};

type BaseNode<T extends string> = {
  id: NodeId;
  type: T;
  name: string;
  rotation: number; // 0, 90, 180, 270
  opacity?: number;
  locked?: boolean;
} & Color &
  Size &
  Position;

type RectNode = BaseNode<'rect'>;
type CircleNode = BaseNode<'circle'>;
export type ImageNode = Omit<BaseNode<'image'>, 'fill' | 'stroke'> & {
  url: string;
};

export type PolygonNode = BaseNode<'polygon'> & {
  points: PolygonPoint[];
  strokeWidth: number;
};

export type SvgNode = BaseNode<'svg'> & {
  url: string;
};

export type GroupNode = BaseNode<'group'> & {
  visible: boolean;
  children: CanvasNode[];
};

export type CanvasNode =
  | RectNode
  | CircleNode
  | PolygonNode
  | ImageNode
  | SvgNode
  | GroupNode;
