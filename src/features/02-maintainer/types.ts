import type { NodeId, SceneNode } from '@/common/types';

/** 부모 노드의 변위(Delta) — 자식 노드에 적용할 변화량 */
export type ParentDeltas = {
  dx: number;
  dy: number;
  dRotation: number;
  dWidth: number;
  dHeight: number;
};

/** 자식 노드에 적용할 업데이트 정보 */
export type ChildUpdate = {
  id: NodeId;
  patch: Partial<SceneNode>;
};

/** 부모 이동 시 자식 동기화를 위한 계획(스냅샷 + 적용할 패치 목록) */
export type ParentChildSyncPlan = {
  /** Undo 시 복원할 자식 노드 스냅샷 */
  childSnapshots: SceneNode[];
  /** Do 시 각 자식에게 적용할 patch 목록 */
  childUpdates: ChildUpdate[];
};
