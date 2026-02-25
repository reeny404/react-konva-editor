import type { NodeId ,SceneNode} from '../types';
import { executeCommand } from './history';
import { documentStore } from '../stores/documentStore';

export const documentCommands = {
  moveNode(id: NodeId, next: Partial<SceneNode>) {
    const prev = documentStore.getState().getNodeById(id);
    if (!prev) return;

    // 1. 변화가 일어날 속성(next의 키값들)에 대해서만 이전 값을 추출
    const prevValues = Object.keys(next).reduce((acc, key) => {
      const k = key as keyof SceneNode;
      (acc as any)[k] = prev[k];
      return acc;
    }, {} as Partial<SceneNode>);

    executeCommand({
      do: () => {
        documentStore.getState().updateNode(id, next);
      },
      undo: () => {
        // 2. 추출해둔 prevValues를 그대로 적용
        documentStore.getState().updateNode(id, prevValues);
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
