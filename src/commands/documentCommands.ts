import { executeCommand } from '@/commands/history';
import { documentStore } from '@/stores/documentStore';
import type { NodeId, SceneNode } from '@/types';

export interface Commander<T extends SceneNode = SceneNode> {
  patchNode(id: NodeId, next: Partial<T>): void;
  addNode(node: T): void;
  removeNode(id: NodeId): void;
}

export const documentCommands: Commander = {
  patchNode(id, next) {
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

  addNode(node) {
    executeCommand({
      do: () => documentStore.getState().addNode(node),
      undo: () => documentStore.getState().removeNode(node.id),
    });
  },

  removeNode(id) {
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
