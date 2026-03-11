export type NodeId = string;

export type Color = {
  fill: string;
  stroke?: string;
};

type BaseNode<T extends string> = {
  id: NodeId;
  type: T;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
} & Color;

export type RectNode = BaseNode<'rect'>;
export type CircleNode = BaseNode<'circle'>;
export type ImageNode = BaseNode<'custom-image'> & {
  url: string;
};

export type SceneNode = RectNode | CircleNode | ImageNode;

export type DocumentModel = {
  nodes: SceneNode[];
};

export type Size = { width: number; height: number };

export type Position = { x: number; y: number };
