import type { SceneNode } from '@/types/node';

export type LayerId = string;

export type DocumentLayer = {
  id: LayerId;
  name: string;
  visible: boolean;
  locked: boolean;
  nodes: SceneNode[];
};
