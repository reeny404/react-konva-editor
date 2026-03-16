import type { CanvasLayer, LayerId } from './layer';
import type { CanvasNode, NodeId } from './node';

export type CanvasDocument = {
  activeLayerId: LayerId | null;
  layers: Record<LayerId, CanvasLayer>;
  layerOrder: LayerId[];
  layerMapper: Record<LayerId, NodeId[]>;
  nodes: Record<NodeId, CanvasNode>;
};
