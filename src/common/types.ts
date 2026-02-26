export type NodeId = string;

export type RectNode = {
  id: NodeId;
  type: 'rect';
  parentId?: NodeId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke?: string;
};

export type SceneNode = RectNode;

export type DocumentModel = {
  nodes: SceneNode[];
};
