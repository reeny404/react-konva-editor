import type { CanvasLayer, LayerId } from './layer';
import type { CanvasNode, NodeId } from './node';

export type CanvasDocument = {
  nodes: Record<NodeId, CanvasNode>;
};

export type LayerDocument = {
  activeLayerId: LayerId | null;
  layers: CanvasLayer[];
  layerMapper: Record<LayerId, NodeId[]>;
};
