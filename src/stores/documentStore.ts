import type { CanvasDocument } from '@/types/document';
import { NodeType, type CanvasNode, type NodeId } from '@/types/node';
import { create } from 'zustand';

type DocumentStoreState = {
  doc: CanvasDocument;
  setDocument: (doc: CanvasDocument) => void;

  getNode: (id?: NodeId) => CanvasNode | undefined;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: NodeId, patch: Partial<CanvasNode>) => void;
  removeNode: (id: NodeId) => void;
};

const DEFAULT_DOCUMENT: CanvasDocument = {
  nodes: {
    'rect-1': {
      id: 'rect-1',
      type: NodeType.Rect,
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
};

export const useDocumentStore = create<DocumentStoreState>()((set, get) => ({
  doc: DEFAULT_DOCUMENT,

  setDocument: (doc) => set({ doc }),
  getNode: (id) => {
    return id ? get().doc.nodes[id] : undefined;
  },
  addNode: (node) => {
    if (get().getNode(node.id)) {
      return;
    }

    set((state) => {
      return {
        doc: {
          ...state.doc,
          nodes: {
            ...state.doc.nodes,
            [node.id]: node,
          },
        },
      };
    });
  },

  updateNode: (id, patch) => {
    set((state) => {
      const node = state.getNode(id);
      if (!node) {
        return state;
      }

      return {
        doc: {
          ...state.doc,
          nodes: {
            ...state.doc.nodes,
            [id]: { ...node, ...patch } as CanvasNode,
          },
        },
      };
    });
  },

  removeNode: (nodeId) =>
    set((state) => {
      if (!state.getNode(nodeId)) {
        return state;
      }

      const { [nodeId]: _, ...nextNodes } = state.doc.nodes;

      return {
        doc: {
          ...state.doc,
          nodes: nextNodes,
        },
      };
    }),
}));
