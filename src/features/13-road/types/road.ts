import type { NodeId, Point } from '@/types/node';

export type RoadToolType = 'road-click';

export type RoadDraft = {
  isDrawing: boolean;
  points: Point[];
  previewPoint: Point | null;
};

export type RoadEditorMode =
  | { type: 'idle' }
  | { type: 'drawing-road' }
  | { type: 'editing-road'; nodeId: NodeId };
