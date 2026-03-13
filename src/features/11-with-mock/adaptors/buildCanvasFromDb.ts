import type { CanvasFloor } from '@/stores/canvasFloorStore';
import type { Document } from '@/stores/documentStore';
import type { SceneNode } from '@/types/node';
import { computeCanvasFloorAndScale } from '../computeCanvasFloorAndScale';
import { adaptScenarioToCanvasDocument } from './scenario/adaptScenarioToCanvasDocument';
import type { ScenarioDb, SubareaDb } from './scenario/types';

/** grid 없을 때 사용하는 캔버스 바닥 기본값 */
const DEFAULT_CANVAS_FLOOR: CanvasFloor = {
  scale: 1,
  size: { width: 3000, height: 3000 },
  cellSize: 100,
};

export type BuildCanvasFromDbResult = {
  document: Document;
  canvasFloor: CanvasFloor;
};

/**
 * 시나리오 DB 데이터로부터 문서(nodes)와 캔버스 바닥(size, cellSize, scale)을 한 번에 계산합니다.
 * 초기화 시 documentStore.setDocument(result.document), canvasFloorStore.setCanvasFloor(result.canvasFloor) 로 넘겨주면 됩니다.
 */
export function buildCanvasFromDb(
  scenario: ScenarioDb,
  subareas: SubareaDb[],
): BuildCanvasFromDbResult {
  const grid = scenario.grid;

  if (!grid) {
    console.warn('Grid data is required, but not found');
    return {
      document: { nodes: [] as SceneNode[] },
      canvasFloor: DEFAULT_CANVAS_FLOOR,
    };
  }

  const canvasFloor = computeCanvasFloorAndScale({
    width: grid.x,
    height: grid.y,
    cellSize: grid.cellSize,
  });

  const document = adaptScenarioToCanvasDocument(scenario, subareas, {
    size: canvasFloor.size,
    cellSize: canvasFloor.cellSize,
    transform: {
      scale: canvasFloor.scale,
      offset: { x: 0, y: 0 },
    },
  });

  return {
    document,
    canvasFloor,
  };
}
