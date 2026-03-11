import { documentCommands as commands } from '@/common/commands/documentCommands';
import { executeCommand } from '@/common/commands/history';
import { documentStore } from '@/common/stores/documentStore';
import type { SceneNode } from '@/common/types';

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
