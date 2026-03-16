import type { Size } from '@/types/geometry';
import { create } from 'zustand';

export type CanvasFloor = {
  size: Size;
  cellSize: number;
  scale: number;
};

const DEFAULT_FLOOR: CanvasFloor = {
  size: { width: 3000, height: 3000 },
  cellSize: 100,
  scale: 1,
};

type CanvasFloorStoreState = {
  floor: CanvasFloor;
  setCanvasFloor: (floor: CanvasFloor) => void;
};

/**
 * features 에서만 사용할 store
 * canvas를 기본적으로 n개 띄울 예정이라, 이 store는 사용하지 않을 예정입니다.
 *
 * @deprecated
 */
export const useCanvasFloorStore = create<CanvasFloorStoreState>()((set) => ({
  floor: DEFAULT_FLOOR,
  setCanvasFloor: (floor) => set((state) => ({ ...state, floor })),
}));
