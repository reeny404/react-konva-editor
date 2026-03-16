// @/types/polygon.ts
import type { NodeId, PolygonPoint } from '@/types/node';

export type PolygonDraft = {
  isDrawing: boolean;
  points: PolygonPoint[];
  previewPoint: PolygonPoint | null;
  isHoveringStartPoint: boolean;
};

export type PolygonEditorMode =
  | { type: 'idle' }
  | { type: 'drawing-polygon' }
  | { type: 'editing-polygon'; nodeId: NodeId };
