import type { Position, Size } from './geometry';
import type { Color } from './style';

export type NodeId = string;

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

export type SvgNode = BaseNode<'svg'> & {
  url: string;
};

export type SceneNode = RectNode | CircleNode | ImageNode | SvgNode;
export type TreeNode = SceneNode & { parentId?: NodeId };
