import type { NodeId, SceneNode } from '@/common/types';
import { executeCommand } from '@/common/commands/history';
import { documentStore } from '@/common/stores/documentStore';

export const documentCommands = {
  moveNode(id: NodeId, next: Partial<SceneNode>) {
    const state = documentStore.getState();
    const prev = state.getNodeById(id);
    if (!prev) return;

    // 1. 부모 노드의 변화량(Delta) 계산 -> 자식도 그만큼 옮기기 위해
    const dx = next.x !== undefined ? next.x - prev.x : 0;
    const dy = next.y !== undefined ? next.y - prev.y : 0;
    const dRotation =
      next.rotation !== undefined ? next.rotation - prev.rotation : 0;

    // Scale 변화량 계산 (이전 너비 대비 새 너비의 비율)
    const dWidth = next.width !== undefined ? next.width - prev.width : 0;
    const dHeight = next.height !== undefined ? next.height - prev.height : 0;

    // 2. 부모의 이전 값 백업(undo용)
    const prevValues = Object.keys(next).reduce((acc, key) => {
      const k = key as keyof SceneNode;
      (acc as any)[k] = prev[k];
      return acc;
    }, {} as Partial<SceneNode>);

    // 3. 자식 노드들 찾기, 전체 상태 백업
    const children = state.doc.nodes.filter((n) => n.parentId === id);
    const childrenSnapshots = children.map((child) => ({ ...child }));

    executeCommand({
      do: () => {
        // 부모 업데이트
        state.updateNode(id, next);
        // 자식 노드들에 대해 dx, dy 만큼 이동
        children.forEach((child) => {
          state.updateNode(child.id, {
            x: child.x + dx,
            y: child.y + dy,
            rotation: (child.rotation || 0) + dRotation,
            width: (child.width || 0) + dWidth,
            height: (child.height || 0) + dHeight,
          });
        });
      },
      undo: () => {
        // 부모 복구
        state.updateNode(id, prevValues);

        // 자식들도 반대로 이동해서 복구
        childrenSnapshots.forEach((oldChild) => {
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
    if (!node) return;
    executeCommand({
      do: () => documentStore.getState().removeNode(id),
      undo: () => documentStore.getState().addNode(node),
    });
  },
};
