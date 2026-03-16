import type { PolygonPoint } from '@/types/node';
import type { PolygonDraft } from '../types/polygon';

export function getBoundingBox(points: PolygonPoint[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

export function rectToPolygonPoints(
  x: number,
  y: number,
  width: number,
  height: number,
): PolygonPoint[] {
  const left = width >= 0 ? x : x + width;
  const top = height >= 0 ? y : y + height;
  const w = Math.abs(width);
  const h = Math.abs(height);

  return [
    { x: left, y: top },
    { x: left + w, y: top },
    { x: left + w, y: top + h },
    { x: left, y: top + h },
  ];
}

export function toLocalPoints(
  points: PolygonPoint[],
  originX: number,
  originY: number,
) {
  return points.map((point) => ({
    x: point.x - originX,
    y: point.y - originY,
  }));
}

export function appendPolygonPoint(
  points: PolygonPoint[],
  point: PolygonPoint,
) {
  return [...points, point];
}

export function insertPolygonPointAt(
  points: PolygonPoint[],
  index: number,
  point: PolygonPoint,
) {
  const nextPoints = [...points];
  nextPoints.splice(index, 0, point);
  return nextPoints;
}

export function replacePolygonPointAt(
  points: PolygonPoint[],
  index: number,
  point: PolygonPoint,
) {
  return points.map((p, i) => (i === index ? point : p));
}

export function createEmptyPolygonDraft(): PolygonDraft {
  return {
    isDrawing: false,
    points: [],
    previewPoint: null,
    isHoveringStartPoint: false,
  };
}
