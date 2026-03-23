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
  Road = 'road',
  ConnectorLine = 'connector-line',
}

export type PolygonPoint = {
  x: number;
  y: number;
};

export type ConnectorLineStyle = 'straight' | 'orthogonal' | 'curved';

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

export type RoadNode = BaseNode<NodeType.Road> & {
  points: PolygonPoint[];
  strokeWidth: number;
  closed?: boolean;
};

export type ConnectorLineNode = Omit<
  BaseNode<NodeType.ConnectorLine>,
  'fill'
> & {
  nodeIds: NodeId[];
  lineStyle: ConnectorLineStyle;
  stroke: string;
  strokeWidth: number;
  tension?: number; // 0 ~ 1
  dash?: number[];
  selectable?: boolean;
  visible?: boolean;
  tooltip?: string;
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
  | RoadNode
  | ConnectorLineNode
  | ImageNode
  | SvgNode
  | GroupNode;
