import type { DocumentCommands } from '@/commands/documentCommands';
import { executeCommand } from '@/commands/history';
import { documentStore } from '@/stores/documentStore';
import type { NodeId, SceneNode } from '@/types/node';
import { getAllDescendants, getAllNodesFromLayers } from '@/utils/nodeUtils';

type TreeNode = SceneNode & { parentId?: NodeId };

/** rect 기능 + 부모 이동 시 자식이 함께 이동하는 documentCommands */
export const documentCommands: DocumentCommands<TreeNode> = {
  patchNode(id, next) {
    const state = documentStore.getState();
    const prev = state.getNodeById(id);
    if (!prev) {
      return;
    }

    const prevNode = prev as TreeNode;
    const prevValues = Object.keys(next).reduce<Partial<TreeNode>>(
      (acc, key) => {
        const k = key as keyof TreeNode;
        (acc as Record<keyof TreeNode, unknown>)[k] = prevNode[k];
        return acc;
      },
      {} as Partial<TreeNode>,
    );

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
    //부모 삭제시 자식도 삭제 (아직 삭제 구현은 하지 않음)
    const state = documentStore.getState();
    const node = state.getNodeById(id);
    if (!node) {
      return;
    }

    const allNodes = getAllNodesFromLayers(state.doc.layers);
    const descendants = getAllDescendants(allNodes, id);

    executeCommand({
      do: () => {
        descendants.forEach((d) => state.removeNode(d.id));
        state.removeNode(id);
      },
      undo: () => {
        state.addNode(node);
        descendants.forEach((d) => state.addNode(d));
      },
    });
  },
};
