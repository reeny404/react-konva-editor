export type NodeId = string;

export type RectNode = {
  id: NodeId;
  type: 'rect';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
};

export type SceneNode = RectNode;

export type DocumentModel = {
  nodes: SceneNode[];
};
