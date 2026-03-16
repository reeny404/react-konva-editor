import { createStore, createStoreHook } from '@/stores/createStore';
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

export const polygonToolStore = createStore<PolygonToolState>((set) => ({
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

export const usePolygonToolStore = createStoreHook(polygonToolStore);
