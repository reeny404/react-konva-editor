import type { Position, Size } from '@/types/geometry';
import type { PolygonShape } from '@/types/shape';

function isPointInPolygon(point: Position, polygon: PolygonShape) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

export function isRectInsidePolygon(
  pos: Position,
  size: Size,
  polygon: PolygonShape,
) {
  const corners: Position[] = [
    { x: pos.x, y: pos.y },
    { x: pos.x + size.width, y: pos.y },
    { x: pos.x + size.width, y: pos.y + size.height },
    { x: pos.x, y: pos.y + size.height },
  ];

  return corners.every((corner) => isPointInPolygon(corner, polygon));
}
