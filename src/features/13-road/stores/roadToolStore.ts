import { create } from 'zustand';
import type { RoadDraft, RoadEditorMode, RoadToolType } from '../types/road';

export type RoadToolState = {
  activeTool: RoadToolType;
  draft: RoadDraft;
  mode: RoadEditorMode;
};

export const useRoadToolStore = create<RoadToolState>(() => ({
  activeTool: 'road-click',
  draft: {
    isDrawing: false,
    points: [],
    previewPoint: null,
  },
  mode: { type: 'idle' },
}));
