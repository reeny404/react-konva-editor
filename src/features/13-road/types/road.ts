import type { NodeId, PolygonPoint } from '@/types/node';

export type RoadToolType = 'road-click';

export type RoadDraft = {
  isDrawing: boolean;
  points: PolygonPoint[];
  previewPoint: PolygonPoint | null;
};

export type RoadEditorMode =
  | { type: 'idle' }
  | { type: 'drawing-road' }
  | { type: 'editing-road'; nodeId: NodeId };
