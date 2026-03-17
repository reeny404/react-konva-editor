import type { Position, Size } from './geometry';
import type { Color } from './style';

export type NodeId = string;
export enum NodeType {
  Rect = 'rect',
  Circle = 'circle',
  Image = 'image',
  Svg = 'svg',
  Group = 'group',
}

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
  | ImageNode
  | SvgNode
  | GroupNode;
