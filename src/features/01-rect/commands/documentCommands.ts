import { documentCommands as commands } from '@/commands/documentCommands';
import { executeCommand } from '@/commands/history';
import { useDocumentStore } from '@/stores/documentStore';
import type { SceneNode } from '@/types/node';

type TreeNode = SceneNode & { parentId?: SceneNode['id'] };

export const documentCommands = {
  ...commands,

  addNode(node: TreeNode) {
    executeCommand({
      do: () => useDocumentStore.getState().addNode(node),
      undo: () => useDocumentStore.getState().removeNode(node.id),
    });
  },
};
