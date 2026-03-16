import type { DocumentCommands } from '@/commands/documentCommands';
import type { CanvasFloor } from '@/stores/canvasFloorStore';
import { computeCanvasFloorAndScale } from '../utils/computeCanvasFloorAndScale';
import { adaptScenarioToCanvasDocument } from './scenario/adaptScenarioToCanvasDocument';
import type { ScenarioDb, SubareaDb } from './scenario/types';

const DEFAULT_CANVAS_FLOOR: CanvasFloor = {
  scale: 1,
  size: { width: 3000, height: 3000 },
  cellSize: 100,
};

export type BuildCanvasFromDbResult = {
  document: Parameters<DocumentCommands['loadDocument']>[0];
  meta: CanvasFloor;
};

/**
 * 시나리오 DB 데이터로부터 문서(nodes)와 캔버스 meta 정보(size, cellSize, scale)를 반환합니다.
 */
export function buildCanvasFromDb(
  scenario: ScenarioDb,
  subareas: SubareaDb[],
): BuildCanvasFromDbResult {
  const grid = scenario.grid;

  if (!grid) {
    console.warn('Grid data is required, but not found');
    return {
      document: {
        nodes: [],
      },
      meta: DEFAULT_CANVAS_FLOOR,
    };
  }

  const meta = computeCanvasFloorAndScale({
    width: grid.x,
    height: grid.y,
    cellSize: grid.cellSize,
  });

  const document = adaptScenarioToCanvasDocument(scenario, subareas, {
    size: meta.size,
    cellSize: meta.cellSize,
    transform: {
      scale: meta.scale,
      offset: { x: 0, y: 0 },
    },
  });

  return {
    meta,
    document,
  };
}
