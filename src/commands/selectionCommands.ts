// commands/selectionCommands.ts
import { selectionStore } from '@/stores/selectionStore';
import type { NodeId } from '@/types/node';

export const selectionCommands = {
  selectOnly(id: NodeId) {
    selectionStore.getState().selectOnly(id);
  },

  clearSelection() {
    selectionStore.getState().clearSelection();
  },
};
