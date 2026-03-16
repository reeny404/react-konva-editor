import type {
  CanvasLayerWithNodes,
  DocumentCommands,
} from '@/commands/documentCommands';
import BOX_ICON from '@/icons/box.svg';
import type { Size } from '@/types/geometry';
import type { CanvasNode } from '@/types/node';
import { v4 as uuid } from 'uuid';
import { LOCKED_DEFAULT } from '../../constant';
import {
  createImageNode,
  createRectNode,
  createSvgNode,
} from '../../utils/createNode';
import type { DbBounds, DbPoint, ScenarioDb, SubareaDb } from './types';

type CoordinateTransform = {
  /**
   * DB 좌표가 너무 큰 경우(예: 300000) Canvas 표시용으로 줄이는 비율.
   * 예) 0.01 → 300000px이 3000px로 축소
   */
  scale: number;
  /**
   * Canvas에서 (0,0)을 어느 DB 좌표에 맞출지.
   * 기본은 (0,0) 고정.
   */
  offset?: DbPoint;
};

type AdaptScenarioToCanvasDocumentOptions = {
  size: Size;
  cellSize: number;
  transform?: CoordinateTransform;
  /**
   * DB의 min/max가 null/undefined일 때를 대비한 기본값.
   * (mock이 항상 값이 있는 편이긴 하지만, 혹시 몰라서..?)
   */
  fallbackBounds?: DbBounds;
};

function toCanvasPoint(
  p: DbPoint,
  t: CoordinateTransform,
  canvasHeight: number,
): DbPoint {
  const scaledX = (p.x - (t.offset?.x ?? 0)) * t.scale;
  const scaledY = (p.y - (t.offset?.y ?? 0)) * t.scale;

  return {
    x: scaledX,
    // DB: 좌측 하단 원점(위로 +y) / Konva: 좌측 상단 원점(아래로 +y)
    y: canvasHeight - scaledY,
  };
}

function boundsToRect(
  bounds: DbBounds,
  t: CoordinateTransform,
  canvasHeight: number,
) {
  const min = toCanvasPoint(bounds.min, t, canvasHeight);
  const max = toCanvasPoint(bounds.max, t, canvasHeight);

  // TODO rotation 값이 0이 아닐 경우, 예상 렌더링 위치가 다름 [반드시 확인 필요 -> 기존 로직에서 rotation 시 min/max 계산식 확인 필요]

  return {
    x: Math.min(min.x, max.x),
    y: Math.min(min.y, max.y),
    width: Math.abs(max.x - min.x),
    height: Math.abs(max.y - min.y),
  };
}

function safeBounds(input: Partial<DbBounds> | undefined, fallback: DbBounds) {
  if (!input?.min || !input?.max) {
    return fallback;
  }
  return { min: input.min, max: input.max };
}

/**
 * Scenario(최상위) + Subarea n개(DB 응답)를 Canvas(Document) 형태로 변환.
 *
 * TODO: 추후 필요 시 확장 가능
 * - 다각형 points 무시하고 rect로 그리도록 되어 있음
 * - structure 추가 필요
 * - Line 추가 필요 (Road, Process Flow 등)
 * - Rotation 값이 0이 아닐 경우, 예상 렌더링 위치가 다름 [반드시 확인 필요 -> 기존 로직에서 rotation 시 min/max 계산식 확인 필요]
 */
export function adaptScenarioToCanvasDocument(
  scenario: ScenarioDb,
  subareas: SubareaDb[],
  options: AdaptScenarioToCanvasDocumentOptions,
): Parameters<DocumentCommands['loadDocument']>[0] {
  const transform = options.transform ?? {
    scale: 0.01,
    offset: { x: 0, y: 0 },
  };
  const fallbackBounds = options.fallbackBounds ?? {
    min: { x: 0, y: 0 },
    max: { x: 0, y: 0 },
  };

  const layers: CanvasLayerWithNodes[] = [];
  const scenarioNodes: CanvasNode[] = [];
  const canvasHeight = options.size.height;

  const bg = scenario.backgroundImage;
  if (bg?.visible) {
    const rect = boundsToRect(
      safeBounds(bg, fallbackBounds),
      transform,
      canvasHeight,
    );
    scenarioNodes.push(
      createImageNode({
        id: uuid(),
        name: 'Background Image',
        rotation: 0,
        url: '/mocks/background.png',
        locked: bg.lock ?? false,
        ...rect,
      }),
    );
  }

  const mainRacks = scenario.mainRacks?.items ?? [];
  for (const rack of mainRacks) {
    if (rack.visible === false) {
      continue;
    }
    const locked = !!(scenario.mainRacks?.lock ?? rack.lock);
    const rect = boundsToRect(
      safeBounds(rack, fallbackBounds),
      transform,
      canvasHeight,
    );
    scenarioNodes.push(
      createRectNode({
        id: uuid(),
        name: rack.rackNumber,
        rotation: rack.rotation ?? 0,
        opacity: rack.opacity ?? 100,
        fill: '#DBEAFE',
        stroke: '#9CA3AF',
        locked,
        ...rect,
      }),
    );

    rack.equipments?.forEach((equipment) => {
      const equipmentRect = boundsToRect(
        safeBounds(equipment, fallbackBounds),
        transform,
        canvasHeight,
      );
      scenarioNodes.push(
        createSvgNode({
          id: uuid(),
          name: equipment.equipmentTag,
          rotation: equipment.equipmentRotation ?? 0,
          fill: '#66FFCC',
          stroke: '#337F66',
          url: BOX_ICON,
          locked,
          ...equipmentRect,
        }),
      );
    });
  }

  layers.push(createLayer('Scenario', scenarioNodes));

  for (const subarea of subareas) {
    const subareaNodes: CanvasNode[] = [];

    const rect = boundsToRect(
      safeBounds(subarea, fallbackBounds),
      transform,
      canvasHeight,
    );
    subareaNodes.push(
      createRectNode({
        id: subarea._id,
        name: subarea.name,
        rotation: 0,
        ...rect,
        fill: subarea.color ?? '#F9CDD2',
        stroke: '#9CA3AF',
        opacity: subarea.opacity ?? 100,
        locked: !!subarea.lock,
      }),
    );

    const subRacks = subarea.subRacks?.items ?? [];
    for (const rack of subRacks) {
      if (rack.visible === false) {
        continue;
      }
      const locked = !!(subarea.subRacks?.lock ?? rack.lock);
      const rect = boundsToRect(
        safeBounds(rack, fallbackBounds),
        transform,
        canvasHeight,
      );
      subareaNodes.push(
        createRectNode({
          id: uuid(),
          name: rack.rackNumber,
          rotation: rack.rotation ?? 0,
          ...rect,
          opacity: rack.opacity ?? 100,
          fill: rack.color ?? '#EDE9FE',
          stroke: '#9CA3AF',
          locked,
        }),
      );
    }

    const buildings = subarea.buildings?.items ?? [];
    for (const building of buildings) {
      if (building.visible === false) {
        continue;
      }
      const locked = !!(subarea.buildings?.lock ?? building.lock);
      const buildingRect = boundsToRect(
        safeBounds(building, fallbackBounds),
        transform,
        canvasHeight,
      );
      subareaNodes.push(
        createRectNode({
          id: uuid(),
          name: building.name,
          rotation: building.rotation ?? 0,
          ...buildingRect,
          opacity: building.opacity ?? 100,
          fill: building.color ?? '#FFEDD5',
          stroke: '#9CA3AF',
          locked,
        }),
      );

      layers.push(createLayer(subarea.name, subareaNodes));
    }

    // TODO 추후 line 이 개발이 완료되면 아래 항목들도 rendering 되도록 추가할 예정
    // roads
    // structures
    // process flows
  }

  return {
    activeLayerId: null,
    layers,
  };
}

function createLayer(name: string, nodes: CanvasNode[]): CanvasLayerWithNodes {
  return {
    id: uuid(),
    name,
    visible: true,
    locked: LOCKED_DEFAULT,
    nodes,
  };
}
