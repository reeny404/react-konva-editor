import { CanvasContainer } from '@/common/ui/CanvasContainer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Rect, Text } from 'react-konva';

type Position = { x: number; y: number };
type Size = { width: number; height: number };
type AreaRect = { x: number; y: number; width: number; height: number };

type PolygonArea = Position[];

const FORBIDDEN_RECT: AreaRect = { x: 100, y: 100, width: 400, height: 400 };
const MOVING_RECT_SIZE: Size = { width: 90, height: 70 };
const POLY_MOVING_RECT_SIZE: Size = { width: 80, height: 60 };

const FORBIDDEN_POLYGON: PolygonArea = [
  { x: 760, y: 140 },
  { x: 1020, y: 120 },
  { x: 1160, y: 330 },
  { x: 980, y: 500 },
  { x: 730, y: 430 },
];

function isPointInPolygon(point: Position, polygon: PolygonArea) {
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

function isPointInRect(point: Position, rect: AreaRect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function areRectsIntersecting(a: AreaRect, b: AreaRect) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function ccw(a: Position, b: Position, c: Position) {
  return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
}

function segmentsIntersect(a: Position, b: Position, c: Position, d: Position) {
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

function rectFromPos(pos: Position, size: Size): AreaRect {
  return { x: pos.x, y: pos.y, width: size.width, height: size.height };
}

function doesRectIntersectPolygon(rect: AreaRect, polygon: PolygonArea) {
  const rectCorners: Position[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];

  const rectEdges: [Position, Position][] = [
    [rectCorners[0], rectCorners[1]],
    [rectCorners[1], rectCorners[2]],
    [rectCorners[2], rectCorners[3]],
    [rectCorners[3], rectCorners[0]],
  ];

  for (const corner of rectCorners) {
    if (isPointInPolygon(corner, polygon)) {
      return true;
    }
  }

  for (const polyPoint of polygon) {
    if (isPointInRect(polyPoint, rect)) {
      return true;
    }
  }

  for (let i = 0; i < polygon.length; i += 1) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];

    for (const [r1, r2] of rectEdges) {
      if (segmentsIntersect(r1, r2, p1, p2)) {
        return true;
      }
    }
  }

  return false;
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const [rectPos, setRectPos] = useState<Position>({ x: 540, y: 200 });
  const [polyRectPos, setPolyRectPos] = useState<Position>({ x: 620, y: 560 });

  const rectPosRef = useRef(rectPos);
  const polyRectPosRef = useRef(polyRectPos);

  useEffect(() => {
    rectPosRef.current = rectPos;
  }, [rectPos]);

  useEffect(() => {
    polyRectPosRef.current = polyRectPos;
  }, [polyRectPos]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setStageSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const polygonPoints = useMemo(
    () => FORBIDDEN_POLYGON.flatMap((p) => [p.x, p.y]),
    [],
  );

  return (
    <CanvasContainer
      containerRef={containerRef}
      width={stageSize.width}
      height={stageSize.height}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={3000}
          height={3000}
          fill='#f8fafc'
          stroke='#cbd5e1'
          strokeWidth={2}
        />

        <Rect
          x={FORBIDDEN_RECT.x}
          y={FORBIDDEN_RECT.y}
          width={FORBIDDEN_RECT.width}
          height={FORBIDDEN_RECT.height}
          fill='rgba(220, 38, 38, 0.15)'
          stroke='#dc2626'
          strokeWidth={2}
          dash={[6, 4]}
        />

        <Text
          x={FORBIDDEN_RECT.x + 8}
          y={FORBIDDEN_RECT.y + 8}
          text='사각형 금지 영역'
          fontSize={14}
          fill='#b91c1c'
        />

        <Line
          points={polygonPoints}
          closed
          fill='rgba(185, 28, 28, 0.12)'
          stroke='#b91c1c'
          strokeWidth={2}
          dash={[6, 4]}
        />

        <Text
          x={740}
          y={105}
          text='다각형 금지 영역'
          fontSize={14}
          fill='#b91c1c'
        />

        <Rect
          x={rectPos.x}
          y={rectPos.y}
          width={MOVING_RECT_SIZE.width}
          height={MOVING_RECT_SIZE.height}
          fill='#22c55e'
          stroke='#166534'
          strokeWidth={2}
          draggable
          dragBoundFunc={(pos) => {
            const nextRect = rectFromPos(pos, MOVING_RECT_SIZE);
            if (areRectsIntersecting(nextRect, FORBIDDEN_RECT)) {
              return rectPosRef.current;
            }
            return pos;
          }}
          onDragMove={(e) => {
            setRectPos({ x: e.target.x(), y: e.target.y() });
          }}
        />

        <Rect
          x={polyRectPos.x}
          y={polyRectPos.y}
          width={POLY_MOVING_RECT_SIZE.width}
          height={POLY_MOVING_RECT_SIZE.height}
          fill='#06b6d4'
          stroke='#155e75'
          strokeWidth={2}
          draggable
          dragBoundFunc={(pos) => {
            const nextRect = rectFromPos(pos, POLY_MOVING_RECT_SIZE);
            if (doesRectIntersectPolygon(nextRect, FORBIDDEN_POLYGON)) {
              return polyRectPosRef.current;
            }
            return pos;
          }}
          onDragMove={(e) => {
            setPolyRectPos({ x: e.target.x(), y: e.target.y() });
          }}
        />
      </Layer>
    </CanvasContainer>
  );
}
