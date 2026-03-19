import type { DocumentCommands } from '@/commands/documentCommands';
import BOX_ICON from '@/icons/box.svg';
import type { Size } from '@/types/geometry';
import { type CanvasNode } from '@/types/node';
import {
  createGroupNode,
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

  const nodes: CanvasNode[] = [];
  const scenarioChildNodes: CanvasNode[] = [];
  const canvasHeight = options.size.height;

  const bg = scenario.backgroundImage;
  if (bg?.visible) {
    scenarioChildNodes.push(
      createImageNode({
        name: 'Background Image',
        rotation: 0,
        url: '/mocks/background.png',
        locked: Boolean(bg.lock),
        ...boundsToRect(
          safeBounds(bg, fallbackBounds),
          transform,
          canvasHeight,
        ),
      }),
    );
  }

  const batteryLimit = scenario.batteryLimit;
  scenarioChildNodes.push(
    createRectNode({
      name: 'Battery Limit',
      rotation: 0,
      opacity: 0.2,
      fill: '#FFFFFF',
      stroke: '#000000',
      locked: Boolean(batteryLimit?.lock),
      ...boundsToRect(
        safeBounds(batteryLimit, fallbackBounds),
        transform,
        canvasHeight,
      ),
    }),
  );

  const mprLayer = scenario.mainRacks;
  for (const mpr of mprLayer?.items ?? []) {
    if (mpr.visible === false) {
      continue;
    }
    const isLockedMpr = Boolean(mprLayer?.lock || mpr.lock);

    scenarioChildNodes.push(
      createRectNode({
        name: mpr.rackNumber,
        rotation: mpr.rotation ?? 0,
        opacity: mpr.opacity ?? 0.5,
        fill: '#DBEAFE',
        stroke: '#9CA3AF',
        locked: isLockedMpr,
        ...boundsToRect(
          safeBounds(mpr, fallbackBounds),
          transform,
          canvasHeight,
        ),
      }),
    );

    mpr.equipments?.forEach((equipment) => {
      scenarioChildNodes.push(
        createSvgNode({
          name: equipment.equipmentTag,
          rotation: equipment.equipmentRotation ?? 0,
          fill: '#66FFCC',
          stroke: '#337F66',
          url: BOX_ICON,
          locked: isLockedMpr,
          ...boundsToRect(
            safeBounds(equipment, fallbackBounds),
            transform,
            canvasHeight,
          ),
        }),
      );
    });
  }

  nodes.push(createGroupNode('Scenario', scenarioChildNodes));

  for (const subarea of subareas) {
    const subareaChildNodes: CanvasNode[] = [];

    subareaChildNodes.push(
      createRectNode({
        name: subarea.name,
        rotation: 0,
        fill: subarea.color ?? '#F9CDD2',
        stroke: '#9CA3AF',
        opacity: subarea.opacity ?? 0.5,
        locked: !!subarea.lock,
        ...boundsToRect(
          safeBounds(subarea, fallbackBounds),
          transform,
          canvasHeight,
        ),
      }),
    );

    const subRackLayer = subarea.subRacks;
    for (const spr of subRackLayer?.items ?? []) {
      if (spr.visible === false) {
        continue;
      }
      subareaChildNodes.push(
        createRectNode({
          name: spr.rackNumber,
          rotation: spr.rotation ?? 0,
          opacity: spr.opacity ?? 0.5,
          fill: spr.color ?? '#EDE9FE',
          stroke: '#9CA3AF',
          locked: Boolean(subRackLayer?.lock || spr.lock),
          ...boundsToRect(
            safeBounds(spr, fallbackBounds),
            transform,
            canvasHeight,
          ),
        }),
      );
    }

    const buildingLayer = subarea.buildings;
    for (const building of buildingLayer?.items ?? []) {
      if (building.visible === false) {
        continue;
      }
      const isLockedBuilding = Boolean(buildingLayer?.lock || building.lock);
      subareaChildNodes.push(
        createRectNode({
          name: building.name,
          rotation: building.rotation ?? 0,
          opacity: building.opacity ?? 0.5,
          fill: building.color ?? '#FFEDD5',
          stroke: '#9CA3AF',
          locked: isLockedBuilding,
          ...boundsToRect(
            safeBounds(building, fallbackBounds),
            transform,
            canvasHeight,
          ),
        }),
      );
    }

    // TODO 추후 line 이 개발이 완료되면 아래 항목들도 rendering 되도록 추가할 예정
    // roads
    // structures
    // process flows

    nodes.push(createGroupNode(subarea.name, subareaChildNodes));
  }

  return {
    nodes,
  };
}
