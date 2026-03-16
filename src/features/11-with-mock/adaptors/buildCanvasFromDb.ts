import type { CanvasFloor } from '@/stores/canvasFloorStore';
import type { SceneNode } from '@/types/node';
import { computeCanvasFloorAndScale } from '../utils/computeCanvasFloorAndScale';
import { adaptScenarioToCanvasDocument } from './scenario/adaptScenarioToCanvasDocument';
import type { ScenarioDb, SubareaDb } from './scenario/types';

const DEFAULT_CANVAS_FLOOR: CanvasFloor = {
  scale: 1,
  size: { width: 3000, height: 3000 },
  cellSize: 100,
};

export type BuildCanvasFromDbResult = {
  document: SceneNode[];
  canvasFloor: CanvasFloor;
};

/**
 * 시나리오 DB 데이터로부터 문서(nodes)와 캔버스 바닥(size, cellSize, scale)을 한 번에 계산합니다.
 * 초기화 시 useDocumentStore.getState().setDocument(...), useCanvasFloorStore.getState().setCanvasFloor(result.canvasFloor) 로 넘겨주면 됩니다.
 */
export function buildCanvasFromDb(
  scenario: ScenarioDb,
  subareas: SubareaDb[],
): BuildCanvasFromDbResult {
  const grid = scenario.grid;

  if (!grid) {
    console.warn('Grid data is required, but not found');
    return {
      document: [],
      canvasFloor: DEFAULT_CANVAS_FLOOR,
    };
  }

  const canvasFloor = computeCanvasFloorAndScale({
    width: grid.x,
    height: grid.y,
    cellSize: grid.cellSize,
  });

  const nodes = adaptScenarioToCanvasDocument(scenario, subareas, {
    size: canvasFloor.size,
    cellSize: canvasFloor.cellSize,
    transform: {
      scale: canvasFloor.scale,
      offset: { x: 0, y: 0 },
    },
  });

  return {
    canvasFloor,
    document: nodes,
  };
}
