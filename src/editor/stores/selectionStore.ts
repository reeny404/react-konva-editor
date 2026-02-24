import type { NodeId } from '../types';
import { createStore, createStoreHook } from './createStore';

type SelectionStoreState = {
  selectedIds: NodeId[];
  selectOnly: (id: NodeId) => void;
  clearSelection: () => void;
};

export const selectionStore = createStore<SelectionStoreState>((set) => ({
  selectedIds: [],
  selectOnly: (id) => set((state) => ({ ...state, selectedIds: [id] })),
  clearSelection: () => set((state) => ({ ...state, selectedIds: [] })),
}));

export const useSelectionStore = createStoreHook(selectionStore);
