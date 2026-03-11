export type Color = {
  fill: string;
  stroke?: string;
};

export type Size = { width: number; height: number };

export type Position = { x: number; y: number };

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

export type SceneNode = RectNode | CircleNode | ImageNode;
export type TreeNode = SceneNode & { parentId?: SceneNode['id'] };
