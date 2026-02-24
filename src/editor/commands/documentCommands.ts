import type { NodeId } from '../types';
import { executeCommand } from './history';
import { documentStore } from '../stores/documentStore';

export const documentCommands = {
  moveNode(id: NodeId, next: { x: number; y: number }) {
    const prev = documentStore.getState().getNodeById(id);
    if (!prev) return;

    executeCommand({
      do: () => {
        documentStore.getState().updateNode(id, next);
      },
      undo: () => {
        documentStore.getState().updateNode(id, { x: prev.x, y: prev.y });
      },
    });
  },
};
