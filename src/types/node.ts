import type { Position, Size } from './geometry';
import type { Color } from './style';

export type NodeId = string;

type BaseNode<T extends string> = {
  id: NodeId;
  type: T;
  name: string;
  rotation: number; // 0, 90, 180, 270
} & Color &
  Size &
  Position;

export type RectNode = BaseNode<'rect'>;
export type CircleNode = BaseNode<'circle'>;
export type ImageNode = BaseNode<'custom-image'> & {
  url: string;
};

export type PolygonPoint = {
  x: number;
  y: number;
};

export type PolygonNode = BaseNode<'polygon'> & {
  points: PolygonPoint[];
  strokeWidth: number;
};

export type SceneNode = RectNode | CircleNode | ImageNode | PolygonNode;
export type TreeNode = SceneNode & { parentId?: NodeId };
