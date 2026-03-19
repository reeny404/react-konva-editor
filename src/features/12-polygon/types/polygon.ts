// @/types/polygon.ts
import type { NodeId, Point } from '@/types/node';

export type RectDraft = {
  isDrawing: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export type PolygonDraft = {
  isDrawing: boolean;
  points: Point[];
  previewPoint: Point | null;
  isHoveringStartPoint: boolean;
};

export type PolygonToolType = 'polygon-click' | 'polygon-rect';

export type PolygonEditorMode =
  | { type: 'idle' }
  | { type: 'drawing-polygon' }
  | { type: 'drawing-polygon-from-rect' }
  | { type: 'editing-polygon'; nodeId: NodeId };
