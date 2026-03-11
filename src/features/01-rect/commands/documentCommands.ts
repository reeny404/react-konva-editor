import { documentCommands as commands } from '@/commands/documentCommands';
import { executeCommand } from '@/commands/history';
import { documentStore } from '@/stores/documentStore';
import type { SceneNode } from '@/types';

type TreeNode = SceneNode & { parentId?: SceneNode['id'] };

export const documentCommands = {
  ...commands,

  addNode(node: TreeNode) {
    executeCommand({
      do: () => documentStore.getState().addNode(node),
      undo: () => documentStore.getState().removeNode(node.id),
    });
  },
};
