import type { CanvasDocument } from '@/types/document';
import type { CanvasLayer, LayerId } from '@/types/layer';
import type { CanvasNode, NodeId } from '@/types/node';

const omitKey = <T>(
  record: Record<string, T>,
  key: string,
): Record<string, T> => {
  const nextRecord = { ...record };
  delete nextRecord[key];
  return nextRecord;
};

const omitKeys = <T>(
  record: Record<string, T>,
  keys: string[],
): Record<string, T> => {
  const nextRecord = { ...record };

  keys.forEach((key) => {
    delete nextRecord[key];
  });

  return nextRecord;
};

const clampInsertIndex = (index: number, length: number): number => {
  return Math.max(0, Math.min(index, length));
};

const findLayerIdContainingNode = (
  doc: CanvasDocument,
  nodeId: NodeId,
): LayerId | undefined => {
  return doc.layerOrder.find((layerId) =>
    doc.layerMapper[layerId]?.includes(nodeId),
  );
};

export const setActiveLayerInDocument = (
  doc: CanvasDocument,
  layerId: LayerId | null,
): CanvasDocument => {
  return {
    ...doc,
    activeLayerId: layerId,
  };
};

export const addNodeToDocument = (
  doc: CanvasDocument,
  node: CanvasNode,
  layerId?: LayerId,
): CanvasDocument => {
  const targetLayerId =
    layerId || doc.activeLayerId || doc.layerOrder[doc.layerOrder.length - 1];

  if (!targetLayerId || !doc.layers[targetLayerId]) {
    return doc;
  }

  return {
    ...doc,
    nodes: {
      ...doc.nodes,
      [node.id]: node,
    },
    layerMapper: {
      ...doc.layerMapper,
      [targetLayerId]: [...(doc.layerMapper[targetLayerId] ?? []), node.id],
    },
  };
};

export const updateNodeInDocument = (
  doc: CanvasDocument,
  nodeId: NodeId,
  patch: Partial<CanvasNode>,
): CanvasDocument => {
  const prevNode = doc.nodes[nodeId];
  if (!prevNode) {
    return doc;
  }

  return {
    ...doc,
    nodes: {
      ...doc.nodes,
      [nodeId]: {
        ...prevNode,
        ...patch,
      } as CanvasNode,
    },
  };
};

export const removeNodeFromDocument = (
  doc: CanvasDocument,
  nodeId: NodeId,
): CanvasDocument => {
  const targetLayerId = findLayerIdContainingNode(doc, nodeId);

  if (!doc.nodes[nodeId] || !targetLayerId) {
    return doc;
  }

  return {
    ...doc,
    nodes: omitKey(doc.nodes, nodeId),
    layerMapper: {
      ...doc.layerMapper,
      [targetLayerId]: (doc.layerMapper[targetLayerId] ?? []).filter(
        (id) => id !== nodeId,
      ),
    },
  };
};

export const addLayerToDocument = (
  doc: CanvasDocument,
  layer: CanvasLayer,
  index?: number,
): CanvasDocument => {
  const nextLayerOrder = [...doc.layerOrder];
  const insertIndex =
    index !== undefined
      ? clampInsertIndex(index, nextLayerOrder.length)
      : nextLayerOrder.length;

  nextLayerOrder.splice(insertIndex, 0, layer.id);

  return {
    ...doc,
    layers: {
      ...doc.layers,
      [layer.id]: layer,
    },
    layerOrder: nextLayerOrder,
    layerMapper: {
      ...doc.layerMapper,
      [layer.id]: doc.layerMapper[layer.id] ?? [],
    },
    activeLayerId: doc.activeLayerId ?? layer.id,
  };
};

export const updateLayerInDocument = (
  doc: CanvasDocument,
  layerId: LayerId,
  patch: Partial<CanvasLayer>,
): CanvasDocument => {
  const prevLayer = doc.layers[layerId];
  if (!prevLayer) {
    return doc;
  }

  return {
    ...doc,
    layers: {
      ...doc.layers,
      [layerId]: {
        ...prevLayer,
        ...patch,
      },
    },
  };
};

export const removeLayerFromDocument = (
  doc: CanvasDocument,
  layerId: LayerId,
): CanvasDocument => {
  if (!doc.layers[layerId]) {
    return doc;
  }

  const removedNodeIds = doc.layerMapper[layerId] ?? [];
  const nextLayerOrder = doc.layerOrder.filter((id) => id !== layerId);

  return {
    ...doc,
    layers: omitKey(doc.layers, layerId),
    nodes: omitKeys(doc.nodes, removedNodeIds),
    layerMapper: omitKey(doc.layerMapper, layerId),
    layerOrder: nextLayerOrder,
    activeLayerId:
      doc.activeLayerId === layerId
        ? (nextLayerOrder[nextLayerOrder.length - 1] ?? null)
        : doc.activeLayerId,
  };
};

export const reorderLayerInDocument = (
  doc: CanvasDocument,
  fromIndex: number,
  toIndex: number,
): CanvasDocument => {
  const layerOrder = [...doc.layerOrder];
  const [removed] = layerOrder.splice(fromIndex, 1);
  if (!removed) {
    return doc;
  }

  layerOrder.splice(toIndex, 0, removed);

  return {
    ...doc,
    layerOrder,
  };
};
