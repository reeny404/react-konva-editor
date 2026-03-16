import type { LayerDocument } from '@/types/document';
import type { CanvasLayer, LayerId } from '@/types/layer';
import type { CanvasNode, NodeId } from '@/types/node';
import { create } from 'zustand';
import { useDocumentStore } from './documentStore';

type CanvasLayerWithNodes = CanvasLayer & { nodes?: NodeId[] };
type LayerStoreState = {
  doc: LayerDocument;

  setActiveLayer: (id: LayerId | null) => void;

  getLayer: (id?: LayerId) => CanvasLayer | undefined;
  addLayer: (layer: CanvasLayerWithNodes, index?: number) => void;
  updateLayer: (id: LayerId, patch: Partial<CanvasLayerWithNodes>) => void;
  removeLayer: (id: LayerId) => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;

  addNode: (layerId: LayerId, node: CanvasNode) => void;
  removeNode: (layerId: LayerId, nodeId: NodeId) => void;
  patchNode: (
    layerId: LayerId,
    nodeId: NodeId,
    patch: Partial<CanvasNode>,
  ) => void;
};

export const useLayerStore = create<LayerStoreState>()((set, get) => ({
  doc: {
    activeLayerId: null,
    layers: [],
    layerMapper: {},
  },

  setActiveLayer: (id) =>
    set((state) => {
      return {
        doc: {
          ...state.doc,
          activeLayerId: id,
        },
      };
    }),

  getLayer: (id) =>
    id ? get().doc.layers.find((layer) => layer.id === id) : undefined,

  addLayer: ({ nodes, ...newLayer }, index = -1) => {
    const i = index === -1 ? get().doc.layers.length : index;
    set((state) => {
      return {
        doc: {
          ...state.doc,
          layers: [
            ...state.doc.layers.slice(0, i),
            newLayer,
            ...state.doc.layers.slice(i),
          ],
          layerMapper: {
            ...state.doc.layerMapper,
            [newLayer.id]: nodes ?? [],
          },
        },
      };
    });
  },

  removeLayer: (id) =>
    set((state) => {
      if (!state.getLayer(id)) {
        return state;
      }

      const newMapper = { ...state.doc.layerMapper };
      delete newMapper[id];

      return {
        doc: {
          ...state.doc,
          layers: state.doc.layers.filter((layer) => layer.id !== id),
          layerMapper: newMapper,
        },
      };
    }),

  updateLayer: (id, { nodes, ...patch }) =>
    set((state) => {
      if (!state.getLayer(id)) {
        return state;
      }

      return {
        doc: {
          ...state.doc,
          layers: state.doc.layers.map((layer) =>
            layer.id === id ? { ...layer, ...patch } : layer,
          ),
          layerMapper: {
            ...state.doc.layerMapper,
            [id]: nodes ?? state.doc.layerMapper[id],
          },
        },
      };
    }),

  reorderLayer: (fromIndex, toIndex) =>
    set((state) => {
      return {
        doc: {
          ...state.doc,
          layers: state.doc.layers.map((layer, index) =>
            index === fromIndex
              ? state.doc.layers[toIndex]
              : index === toIndex
                ? state.doc.layers[fromIndex]
                : layer,
          ),
        },
      };
    }),

  addNode: (layerId, node) => {
    useDocumentStore.getState().addNode(node);
    set((state) => {
      return {
        doc: {
          ...state.doc,
          layerMapper: {
            ...state.doc.layerMapper,
            [layerId]: [...state.doc.layerMapper[layerId], node.id],
          },
        },
      };
    });
  },

  removeNode: (layerId, nodeId) => {
    useDocumentStore.getState().removeNode(nodeId);
    set((state) => {
      return {
        doc: {
          ...state.doc,
          layerMapper: {
            ...state.doc.layerMapper,
            [layerId]: state.doc.layerMapper[layerId].filter(
              (id) => id !== nodeId,
            ),
          },
        },
      };
    });
  },

  patchNode: (layerId, nodeId, patch) => {
    useDocumentStore.getState().updateNode(nodeId, patch);
    set((state) => {
      return {
        doc: {
          ...state.doc,
          layerMapper: {
            ...state.doc.layerMapper,
            [layerId]: state.doc.layerMapper[layerId].filter(
              (id) => id !== nodeId,
            ),
          },
        },
      };
    });
  },
}));
