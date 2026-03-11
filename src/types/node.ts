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

type RectNode = BaseNode<'rect'>;
type CircleNode = BaseNode<'circle'>;
export type ImageNode = BaseNode<'custom-image'> & {
  url: string;
};

export type SceneNode = RectNode | CircleNode | ImageNode;
export type TreeNode = SceneNode & { parentId?: SceneNode['id'] };
