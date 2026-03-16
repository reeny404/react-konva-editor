import type { DocumentLayer, LayerId } from '@/types/layer';
import type { NodeId, SceneNode } from '@/types/node';
import { create } from 'zustand';

type Document = {
  layers: DocumentLayer[];
};

type DocumentStoreState = {
  doc: Document;
  activeLayerId: LayerId | null;
  setDocument: (doc: Document) => void;
  setActiveLayer: (id: LayerId | null) => void;

  // Node actions
  updateNode: (id: NodeId, patch: Partial<SceneNode>) => void;
  addNode: (node: SceneNode, layerId?: LayerId) => void;
  removeNode: (id: NodeId) => void;
  getNodeById: (id: NodeId) => SceneNode | undefined;

  // Layer actions
  addLayer: (layer: DocumentLayer) => void;
  removeLayer: (id: LayerId) => void;
  updateLayer: (id: LayerId, patch: Partial<DocumentLayer>) => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;
  getLayerById: (id: LayerId) => DocumentLayer | undefined;
};

export const useDocumentStore = create<DocumentStoreState>()((set, get) => ({
  doc: {
    layers: [
      {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        nodes: [
          {
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
        ],
      },
    ],
  },
  activeLayerId: 'layer-1',
  setDocument: (doc) => set((state) => ({ ...state, doc })),
  setActiveLayer: (id) => set((state) => ({ ...state, activeLayerId: id })),

  // --- Node Methods ---
  updateNode: (id, patch) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        layers: state.doc.layers.map((layer) => ({
          ...layer,
          nodes: layer.nodes.map((node) =>
            node.id === id ? ({ ...node, ...patch } as SceneNode) : node,
          ),
        })),
      },
    })),

  addNode: (node, layerId) =>
    set((state) => {
      const { layers } = state.doc;
      const { activeLayerId } = state;
      const targetLayerId =
        layerId || activeLayerId || layers[layers.length - 1]?.id;

      return {
        ...state,
        doc: {
          ...state.doc,
          layers: layers.map((layer) =>
            layer.id === targetLayerId
              ? { ...layer, nodes: [...layer.nodes, node] }
              : layer,
          ),
        },
      };
    }),

  removeNode: (id) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        layers: state.doc.layers.map((layer) => ({
          ...layer,
          nodes: layer.nodes.filter((node) => node.id !== id),
        })),
      },
    })),

  getNodeById: (id) => {
    for (const layer of get().doc.layers) {
      const node = layer.nodes.find((n) => n.id === id);
      if (node) {
        return node;
      }
    }
    return undefined;
  },

  // --- Layer Methods ---
  addLayer: (layer) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        layers: [...state.doc.layers, layer],
      },
    })),

  removeLayer: (id) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        layers: state.doc.layers.filter((layer) => layer.id !== id),
      },
    })),

  updateLayer: (id, patch) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        layers: state.doc.layers.map((layer) =>
          layer.id === id ? { ...layer, ...patch } : layer,
        ),
      },
    })),

  reorderLayer: (fromIndex, toIndex) =>
    set((state) => {
      const layers = [...state.doc.layers];
      const [removed] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, removed);
      return {
        ...state,
        doc: {
          ...state.doc,
          layers,
        },
      };
    }),

  getLayerById: (id) => get().doc.layers.find((l) => l.id === id),
}));
