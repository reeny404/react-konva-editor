import type { NodeId ,SceneNode} from '../types';
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

  addNode(node: SceneNode) {
    executeCommand({
      do: () => documentStore.getState().addNode(node),
      undo: () => documentStore.getState().removeNode(node.id),
    });
  },

  removeNode(id: NodeId) {
    const node = documentStore.getState().getNodeById(id);
    if (!node) return;
    executeCommand({
      do: () => documentStore.getState().removeNode(id),
      undo: () => documentStore.getState().addNode(node),
    });
  },


};
