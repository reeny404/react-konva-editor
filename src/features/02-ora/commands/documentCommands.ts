import type { DocumentCommands } from '@/commands/documentCommands';
import { documentCommands as baseCommands } from '@/commands/documentCommands';
import { executeCommand } from '@/commands/history';
import { getAllDescendants } from '@/features/02-ora/utils/nodeUtils';
import { useDocumentStore } from '@/stores/documentStore';
import type { CanvasNode, NodeId } from '@/types/node';

type TreeNode = CanvasNode & { parentId?: NodeId };

/** rect 기능 + 부모 이동 시 자식이 함께 이동하는 documentCommands */
export const documentCommands: DocumentCommands<TreeNode> = {
  ...baseCommands,

  patchNode(id, next) {
    const state = useDocumentStore.getState();
    const prev = state.getNode(id);
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
      do: () => useDocumentStore.getState().addNode(node),
      undo: () => useDocumentStore.getState().removeNode(node.id),
    });
  },

  removeNode(id) {
    //부모 삭제시 자식도 삭제 (아직 삭제 구현은 하지 않음)
    const {
      getNode,
      doc: { nodes },
    } = useDocumentStore.getState();
    const node = getNode(id);
    if (!node) {
      return;
    }
    const descendants = getAllDescendants(Object.values(nodes), id);

    executeCommand({
      do: () => {
        const removeNode = useDocumentStore.getState().removeNode;
        descendants.forEach((d) => removeNode(d.id));
        removeNode(id);
      },
      undo: () => {
        const addNode = useDocumentStore.getState().addNode;
        descendants.forEach((d) => addNode(d));
        addNode(node);
      },
    });
  },
};
