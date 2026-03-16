import type { NodeId } from '@/types/node';
import { create } from 'zustand';

type SelectionStoreState = {
  selectedIds: NodeId[];
  selectOnly: (id: NodeId) => void;
  clearSelection: () => void;
};

export const useSelectionStore = create<SelectionStoreState>()((set) => ({
  selectedIds: [],
  selectOnly: (id) => set((state) => ({ ...state, selectedIds: [id] })),
  clearSelection: () => set((state) => ({ ...state, selectedIds: [] })),
}));
