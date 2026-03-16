import { executeCommand } from '@/commands/history';
import { useDocumentStore } from '@/stores/documentStore';
import type { NodeId, SceneNode } from '@/types/node';

export interface DocumentCommands<T extends SceneNode = SceneNode> {
  patchNode(id: NodeId, next: Partial<T>): void;
  addNode(node: T): void;
  removeNode(id: NodeId): void;
}

export const documentCommands: DocumentCommands = {
  patchNode(id, next) {
    const state = useDocumentStore.getState();
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
      do: () => useDocumentStore.getState().addNode(node),
      undo: () => useDocumentStore.getState().removeNode(node.id),
    });
  },

  removeNode(id) {
    const node = useDocumentStore.getState().getNodeById(id);
    if (!node) {
      return;
    }
    executeCommand({
      do: () => useDocumentStore.getState().removeNode(id),
      undo: () => useDocumentStore.getState().addNode(node),
    });
  },
};
