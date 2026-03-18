import { create } from 'zustand';
import type {
  PolygonDraft,
  PolygonEditorMode,
  PolygonToolType,
  RectDraft,
} from '../types/polygon';

export type PolygonToolState = {
  activeTool: PolygonToolType;
  draft: PolygonDraft;
  rectDraft: RectDraft;
  mode: PolygonEditorMode;
};

export const usePolygonToolStore = create<PolygonToolState>((set) => ({
  activeTool: 'polygon-click',
  draft: {
    isDrawing: false,
    points: [],
    previewPoint: null,
    isHoveringStartPoint: false,
  },
  rectDraft: null,
  mode: { type: 'idle' },
}));
