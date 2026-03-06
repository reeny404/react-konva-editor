// commands/selectionCommands.ts
import { selectionStore } from '@/common/stores/selectionStore';
import type { NodeId } from '@/common/types';

export const selectionCommands = {
  selectOnly(id: NodeId) {
    selectionStore.getState().selectOnly(id);
  },

  clearSelection() {
    selectionStore.getState().clearSelection();
  },
};
