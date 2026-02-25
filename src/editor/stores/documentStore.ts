import type { DocumentModel, NodeId, SceneNode } from '../types';
import { createStore, createStoreHook } from './createStore';

type DocumentStoreState = {
  doc: DocumentModel;
  setDocument: (doc: DocumentModel) => void;
  updateNode: (id: NodeId, patch: Partial<SceneNode>) => void;
  addNode: (node: SceneNode) => void;
  removeNode: (id: NodeId) => void;
  getNodeById: (id: NodeId) => SceneNode | undefined;
};

const initialDocument: DocumentModel = {
  nodes: [
    {
      id: 'rect-1',
      type: 'rect',
      name: 'Rectangle 1',
      x: 120,
      y: 90,
      width: 180,
      height: 120,
      fill: '#0f172a',
      stroke: '#38bdf8',
    },
  ],
};

export const documentStore = createStore<DocumentStoreState>((set, get) => ({
  doc: initialDocument,
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
  // addNode 구현: 기존 노드 배열에 새로운 노드 결합
  addNode: (node) =>
    set((state) => ({
      ...state,
      doc: {
        ...state.doc,
        nodes: [...state.doc.nodes, node],
      },
    })),

  // removeNode 구현: 특정 ID를 제외한 새로운 배열 생성
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
