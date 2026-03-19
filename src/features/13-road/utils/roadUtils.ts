import type { Point } from '@/types/node';
import type { RoadDraft } from '../types/road';

export function createEmptyRoadDraft(): RoadDraft {
  return {
    isDrawing: false,
    points: [],
    previewPoint: null,
  };
}

export function flattenPoints(points: Point[]): number[] {
  return points.flatMap((p) => [p.x, p.y]);
}

export function getBoundingBox(points: Point[]) {
  if (points.length === 0) {
    return { minX: 0, minY: 0, width: 0, height: 0 };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    minX,
    minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  };
}

export function toLocalPoints(
  points: Point[],
  originX: number,
  originY: number,
): Point[] {
  return points.map((p) => ({ x: p.x - originX, y: p.y - originY }));
}

/**
 * 선분(edge) 목록 반환
 * - closed=false: 열린 라인 (Road) → 마지막-첫점 연결 없음
 * - closed=true : 닫힌 폴리곤처럼 처리
 */
export function getRoadEdges(points: Point[], closed = false) {
  const len = closed ? points.length : points.length - 1;
  return Array.from({ length: len }, (_, i) => {
    const next = (i + 1) % points.length;
    return {
      start: points[i],
      end: points[next],
      edgeIndex: i,
      insertIndex: i + 1,
    };
  });
}
