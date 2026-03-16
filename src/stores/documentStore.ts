import type { CanvasDocument } from '@/types/document';
import type { CanvasLayer, LayerId } from '@/types/layer';
import type { CanvasNode, NodeId } from '@/types/node';
import { create } from 'zustand';
import {
  addLayerToDocument,
  addNodeToDocument,
  removeLayerFromDocument,
  removeNodeFromDocument,
  reorderLayerInDocument,
  setActiveLayerInDocument,
  updateLayerInDocument,
  updateNodeInDocument,
} from './mutations/documentMutations';

type DocumentStoreState = {
  doc: CanvasDocument;
  setDocument: (doc: CanvasDocument) => void;
  setActiveLayer: (id: LayerId | null) => void;

  getNode: (id?: NodeId) => CanvasNode | null;
  addNode: (node: CanvasNode, layerId?: LayerId) => void;
  updateNode: (id: NodeId, patch: Partial<CanvasNode>) => void;
  removeNode: (id: NodeId) => void;

  getLayer: (id?: LayerId) => CanvasLayer | null;
  addLayer: (layer: CanvasLayer, index?: number) => void;
  updateLayer: (id: LayerId, patch: Partial<CanvasLayer>) => void;
  removeLayer: (id: LayerId) => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;
};

const DEFAULT_DOCUMENT: CanvasDocument = {
  activeLayerId: 'layer-1',
  layerOrder: ['layer-1'],
  layers: {
    'layer-1': {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      locked: false,
    },
  },
  nodes: {
    'rect-1': {
      id: 'rect-1',
      type: 'rect',
      name: 'Rect 1',
      x: 120,
      y: 90,
      width: 180,
      height: 120,
      rotation: 0,
      fill: '#0f172a',
      stroke: '#38bdf8',
    },
  },
  layerMapper: {
    'layer-1': ['rect-1'],
  },
};

export const useDocumentStore = create<DocumentStoreState>()((set, get) => ({
  doc: DEFAULT_DOCUMENT,

  setDocument: (doc) => set({ doc }),

  setActiveLayer: (id) =>
    set((state) => ({
      doc: setActiveLayerInDocument(state.doc, id),
    })),

  getNode: (id) => (id ? get().doc.nodes[id] : null),

  addNode: (node, layerId) =>
    set((state) => {
      const nextDoc = addNodeToDocument(state.doc, node, layerId);
      if (nextDoc === state.doc) {
        return state;
      }

      return {
        doc: nextDoc,
      };
    }),

  updateNode: (id, patch) =>
    set((state) => {
      const prevNode = state.getNode(id);
      if (!prevNode) {
        return state;
      }

      return {
        doc: updateNodeInDocument(state.doc, id, patch),
      };
    }),

  removeNode: (nodeId) =>
    set((state) => {
      if (!state.getNode(nodeId)) {
        return state;
      }

      return {
        doc: removeNodeFromDocument(state.doc, nodeId),
      };
    }),

  getLayer: (id) => (id ? get().doc.layers[id] : null),

  addLayer: (layer, index) =>
    set((state) => {
      const nextDoc = addLayerToDocument(state.doc, layer, index);
      if (nextDoc === state.doc) {
        return state;
      }

      return {
        doc: nextDoc,
      };
    }),

  removeLayer: (id) =>
    set((state) => {
      if (!state.getLayer(id)) {
        return state;
      }

      return {
        doc: removeLayerFromDocument(state.doc, id),
      };
    }),

  updateLayer: (id, patch) =>
    set((state) => {
      if (!state.getLayer(id)) {
        return state;
      }

      return {
        doc: updateLayerInDocument(state.doc, id, patch),
      };
    }),

  reorderLayer: (fromIndex, toIndex) =>
    set((state) => {
      const nextDoc = reorderLayerInDocument(state.doc, fromIndex, toIndex);
      if (nextDoc === state.doc) {
        return state;
      }

      return {
        doc: nextDoc,
      };
    }),
}));
