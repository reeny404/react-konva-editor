import { executeCommand } from '@/common/commands/history';
import { documentStore } from '@/common/stores/documentStore';
import type { NodeId, SceneNode } from '@/common/types';

/** rect 기능 + 부모 이동 시 자식이 함께 이동하는 documentCommands */
export const documentCommands = {
  moveNode(id: NodeId, next: Partial<SceneNode>) {
    const state = documentStore.getState();
    const prev = state.getNodeById(id);
    if (!prev) {
      return;
    }

    // 부모 변위 계산 및 자식 동기화 계획 생성
    /**
     * 부모 노드의 이전 상태와 다음 상태로부터 자식에 적용할 변화량(Delta)을 계산합니다.
     * 부모가 이동/회전/스케일될 때 자식이 같은 양만큼 따라가도록 할 때 사용합니다.
     */
    const deltas = {
      dx: next.x !== undefined ? next.x - prev.x : 0,
      dy: next.y !== undefined ? next.y - prev.y : 0,
      dRotation:
        next.rotation !== undefined ? next.rotation - (prev.rotation ?? 0) : 0,
      dWidth: next.width !== undefined ? next.width - prev.width : 0,
      dHeight: next.height !== undefined ? next.height - prev.height : 0,
    };
    const childrenNodes = state.doc.nodes.filter((n) => n.parentId === id);
    const syncPlan = {
      childSnapshots: childrenNodes.map((child) => ({ ...child })),
      childUpdates: childrenNodes.map((child) => ({
        id: child.id,
        patch: {
          x: child.x + deltas.dx,
          y: child.y + deltas.dy,
          rotation: (child.rotation ?? 0) + deltas.dRotation,
          width: (child.width ?? 0) + deltas.dWidth,
          height: (child.height ?? 0) + deltas.dHeight,
        },
      })),
    };

    const prevValues = Object.keys(next).reduce((acc, key) => {
      const k = key as keyof SceneNode;
      (acc as Record<string, unknown>)[k] = prev[k];
      return acc;
    }, {} as Partial<SceneNode>);

    executeCommand({
      do: () => {
        state.updateNode(id, next);
        syncPlan.childUpdates.forEach(({ id: childId, patch }) => {
          state.updateNode(childId, patch);
        });
      },
      undo: () => {
        state.updateNode(id, prevValues);
        syncPlan.childSnapshots.forEach((oldChild) => {
          state.updateNode(oldChild.id, oldChild);
        });
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
    if (!node) {
      return;
    }
    executeCommand({
      do: () => documentStore.getState().removeNode(id),
      undo: () => documentStore.getState().addNode(node),
    });
  },
};
