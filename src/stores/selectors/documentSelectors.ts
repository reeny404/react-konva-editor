import type { CanvasDocument } from '../../types/document';
import type { CanvasLayer, LayerId } from '../../types/layer';
import type { CanvasNode, NodeId } from '../../types/node';

export type HydratedLayer = CanvasLayer & {
  nodes: CanvasNode[];
  order: number;
};

export const getLayersInOrder = (doc: CanvasDocument): CanvasLayer[] => {
  return doc.layerOrder
    .map((layerId) => doc.layers[layerId])
    .filter((layer): layer is CanvasLayer => Boolean(layer));
};

export const getHydratedLayers = (doc: CanvasDocument): HydratedLayer[] => {
  return getLayersInOrder(doc).map((layer, order) => ({
    ...layer,
    order,
    nodes: (doc.layerMapper[layer.id] ?? [])
      .map((nodeId) => doc.nodes[nodeId])
      .filter((node): node is CanvasNode => Boolean(node)),
  }));
};

export const getNodesInRenderOrder = (doc: CanvasDocument): CanvasNode[] => {
  return getLayersInOrder(doc).flatMap((layer) =>
    (doc.layerMapper[layer.id] ?? [])
      .map((nodeId) => doc.nodes[nodeId])
      .filter((node): node is CanvasNode => Boolean(node)),
  );
};

export const getNodesByLayerId = (
  doc: CanvasDocument,
  layerId: LayerId,
): CanvasNode[] => {
  return (doc.layerMapper[layerId] ?? [])
    .map((nodeId) => doc.nodes[nodeId])
    .filter((node): node is CanvasNode => Boolean(node));
};

/** doc에서 nodeId가 속한 레이어 ID 반환 */
export const findLayerIdByNodeId = (
  doc: CanvasDocument,
  nodeId: NodeId,
): LayerId | undefined => {
  return doc.layerOrder.find((layerId) =>
    doc.layerMapper[layerId]?.includes(nodeId),
  );
};

/** 해당 노드가 속한 레이어가 잠금 상태인지 여부 */
export const isNodeLockedInLayers = (
  doc: CanvasDocument,
  nodeId: NodeId,
): boolean => {
  const layerId = findLayerIdByNodeId(doc, nodeId);
  if (!layerId) {
    return false;
  }
  return doc.layers[layerId]?.locked ?? false;
};
