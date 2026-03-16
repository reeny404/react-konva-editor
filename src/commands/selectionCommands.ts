// commands/selectionCommands.ts
import { useSelectionStore } from '@/stores/selectionStore';
import type { NodeId } from '@/types/node';

export const selectionCommands = {
  selectOnly(id: NodeId) {
    useSelectionStore.getState().selectOnly(id);
  },

  clearSelection() {
    useSelectionStore.getState().clearSelection();
  },
};
