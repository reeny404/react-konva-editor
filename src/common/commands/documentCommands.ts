import { executeCommand } from '@/common/commands/history';
import { documentStore } from '@/common/stores/documentStore';
import type { NodeId, SceneNode } from '@/common/types';

export const documentCommands = {
  moveNode(id: NodeId, next: Partial<SceneNode>) {
    const state = documentStore.getState();
    const prev = state.getNodeById(id);
    if (!prev) {
      return;
    }

    const prevValues = Object.keys(next).reduce((acc, key) => {
      const k = key as keyof SceneNode;
      (acc as Record<string, unknown>)[k] = prev[k];
      return acc;
    }, {} as Partial<SceneNode>);

    executeCommand({
      do: () => state.updateNode(id, next),
      undo: () => state.updateNode(id, prevValues),
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
    if (!node) {
      return;
    }
    executeCommand({
      do: () => documentStore.getState().removeNode(id),
      undo: () => documentStore.getState().addNode(node),
    });
  },
};
