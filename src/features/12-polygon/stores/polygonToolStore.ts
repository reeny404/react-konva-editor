import { createStore, createStoreHook } from '@/stores/createStore';
import type { PolygonDraft, PolygonEditorMode } from '../types/polygon';

export type PolygonToolState = {
  draft: PolygonDraft;
  mode: PolygonEditorMode;
};

export const polygonToolStore = createStore<PolygonToolState>((set) => ({
  draft: {
    isDrawing: false,
    points: [],
    previewPoint: null,
    isHoveringStartPoint: false,
  },
  mode: { type: 'idle' },
}));

export const usePolygonToolStore = createStoreHook(polygonToolStore);
