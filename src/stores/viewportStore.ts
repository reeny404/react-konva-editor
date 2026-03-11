import { createStore, createStoreHook } from './createStore';

type ViewportStoreState = {
  zoom: number;
  panX: number;
  panY: number;
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
};

export const viewportStore = createStore<ViewportStoreState>((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  setZoom: (zoom) => set((state) => ({ ...state, zoom })),
  setPan: (panX, panY) => set((state) => ({ ...state, panX, panY })),
}));

export const useViewportStore = createStoreHook(viewportStore);
