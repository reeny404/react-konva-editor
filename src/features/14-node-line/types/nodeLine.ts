import type {
  ConnectorLineNode,
  ConnectorLineStyle,
  NodeId,
  RectNode,
} from '@/types/node';

export type NodeLineBoxNode = RectNode;

export type ConnectorViewModel = {
  id: NodeId;
  name: string;
  nodeIds: NodeId[];
  lineStyle: ConnectorLineStyle;
  stroke: string;
  strokeWidth: number;
  tension?: number;
  dash?: number[];
  visible: boolean;
  selectable: boolean;
  readonly: boolean;
  tooltip?: string;
  isSelected: boolean;
  points: number[];
  tooltipPosition: { x: number; y: number } | null;
};

export type NodeLineSelection =
  | { type: 'none' }
  | { type: 'box'; node: NodeLineBoxNode }
  | { type: 'connector'; node: ConnectorLineNode };
