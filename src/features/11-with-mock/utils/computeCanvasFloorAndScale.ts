import type { Size } from '@/types/geometry';

/** 캔버스 바닥 한 변 최대 허용 값 (초과 불가) */
const MAX_FLOOR_SIZE = 10_000;

/** 스케일 적용 후 그리드 간격의 최소값 (px). 이 값 미만이면 그리드가 너무 촘촘해짐 */
const MIN_GRID_SPACING = 10;

export type ScenarioGrid = {
  width: number;
  height: number;
  cellSize: number;
};

export type CanvasFloorResult = {
  scale: number;
  size: Size;
  cellSize: number;
};

/**
 * 시나리오 그리드 정보로부터 캔버스 바닥 크기와 스케일을 계산합니다.
 *
 * 제약 조건:
 * - 캔버스 바닥 한 변은 MAX_FLOOR_SIZE(10000)을 초과할 수 없음
 * - 스케일 적용 후 그리드 간격(cellSize)은 MIN_GRID_SPACING(10) 이상
 *
 * @example
 * grid: { width: 300000, height: 400000, cellSize: 1000 }
 * → { scale: 0.01, floorSize: { width: 3000, height: 4000, cellSize: 10 } }
 */
export function computeCanvasFloorAndScale(
  grid: ScenarioGrid,
): CanvasFloorResult {
  const { width, height, cellSize } = grid;
  const maxDimension = Math.max(width, height);

  // 바닥이 10000을 넘지 않도록 하는 스케일
  const scaleToFitFloor = MAX_FLOOR_SIZE / maxDimension;

  // 그리드 간격이 MIN_GRID_SPACING 이상이 되도록 하는 스케일
  const scaleForGrid = MIN_GRID_SPACING / cellSize;

  // 두 조건을 모두 만족하려면 더 작은 스케일(축소를 더 많이) 사용
  const scale = Math.min(scaleToFitFloor, scaleForGrid);

  const size = {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };

  return { scale, size, cellSize: Math.round(cellSize * scale) };
}
