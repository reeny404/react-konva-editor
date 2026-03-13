import type { DocumentLayer } from '@/types/layer';
import type { NodeId, SceneNode } from '@/types/node';

// 모든 레이어에서 모든 노드를 추출.

export const getAllNodesFromLayers = (layers: DocumentLayer[]): SceneNode[] => {
  return layers.flatMap((l) => l.nodes);
};

//특정 노드가 잠긴 레이어에 속해 있는지 확인

export const isNodeLockedInLayers = (
  layers: DocumentLayer[],
  nodeId: NodeId,
): boolean => {
  return layers.some((l) => l.locked && l.nodes.some((n) => n.id === nodeId));
};
