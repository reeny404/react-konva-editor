import type { NodeId, SceneNode } from '../types';
import { createStore, createStoreHook } from './createStore';

export type Document = {
  nodes: SceneNode[];
};

type DocumentStoreState = {
  doc: Document;
  setDocument: (doc: Document) => void;
  updateNode: (id: NodeId, patch: Partial<SceneNode>) => void;
  addNode: (node: SceneNode) => void;
  removeNode: (id: NodeId) => void;
  getNodeById: (id: NodeId) => SceneNode | undefined;
};

export const documentStore = createStore<DocumentStoreState>((set, get) => ({
  doc: {
    nodes: [
      {
        id: 'rect-1',
        type: 'rect',
        name: 'Rectangle 1',
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
  setDocument: (doc) => set((state) => ({ ...state, doc })),

  updateNode: (id, patch) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        nodes: state.doc.nodes.map((node) =>
          node.id === id ? ({ ...node, ...patch } as SceneNode) : node,
        ),
      },
    })),

  addNode: (node) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        nodes: [...state.doc.nodes, node],
      },
    })),

  removeNode: (id) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        nodes: state.doc.nodes.filter((node) => node.id !== id),
      },
    })),
  getNodeById: (id) => get().doc.nodes.find((node) => node.id === id),
}));

export const useDocumentStore = createStoreHook(documentStore);
