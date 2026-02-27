import { CanvasContainer } from '@/common/ui/CanvasContainer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Rect, Text } from 'react-konva';

type Position = { x: number; y: number };
type AreaRect = { x: number; y: number; width: number; height: number };

type PolygonArea = Position[];

const RECT_ALLOWED_AREA: AreaRect = { x: 100, y: 100, width: 400, height: 400 };
const RECT_SIZE = { width: 90, height: 70 };
const POLY_RECT_SIZE = { width: 80, height: 60 };

const ALLOWED_POLYGON: PolygonArea = [
  { x: 760, y: 130 },
  { x: 1040, y: 100 },
  { x: 1180, y: 320 },
  { x: 980, y: 520 },
  { x: 700, y: 430 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

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

function isRectInsidePolygon(
  pos: Position,
  size: { width: number; height: number },
  polygon: PolygonArea,
) {
  const corners: Position[] = [
    { x: pos.x, y: pos.y },
    { x: pos.x + size.width, y: pos.y },
    { x: pos.x + size.width, y: pos.y + size.height },
    { x: pos.x, y: pos.y + size.height },
  ];

  return corners.every((corner) => isPointInPolygon(corner, polygon));
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const [rectPos, setRectPos] = useState<Position>({ x: 130, y: 130 });
  const [polyRectPos, setPolyRectPos] = useState<Position>({ x: 860, y: 220 });

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
    () => ALLOWED_POLYGON.flatMap((p) => [p.x, p.y]),
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

        <Text x={20} y={20} text='allowed-zone' fontSize={16} fill='#0f172a' />

        <Rect
          x={RECT_ALLOWED_AREA.x}
          y={RECT_ALLOWED_AREA.y}
          width={RECT_ALLOWED_AREA.width}
          height={RECT_ALLOWED_AREA.height}
          fill='rgba(22, 163, 74, 0.12)'
          stroke='#16a34a'
          strokeWidth={2}
          dash={[6, 4]}
        />

        <Text
          x={RECT_ALLOWED_AREA.x + 8}
          y={RECT_ALLOWED_AREA.y + 8}
          text='사각형 허용 영역'
          fontSize={14}
          fill='#166534'
        />

        <Line
          points={polygonPoints}
          closed
          fill='rgba(14, 116, 144, 0.12)'
          stroke='#0e7490'
          strokeWidth={2}
          dash={[6, 4]}
        />

        <Text
          x={740}
          y={95}
          text='다각형 허용 영역'
          fontSize={14}
          fill='#0e7490'
        />

        <Rect
          x={rectPos.x}
          y={rectPos.y}
          width={RECT_SIZE.width}
          height={RECT_SIZE.height}
          fill='#22c55e'
          stroke='#166534'
          strokeWidth={2}
          draggable
          dragBoundFunc={(pos) => ({
            x: clamp(
              pos.x,
              RECT_ALLOWED_AREA.x,
              RECT_ALLOWED_AREA.x + RECT_ALLOWED_AREA.width - RECT_SIZE.width,
            ),
            y: clamp(
              pos.y,
              RECT_ALLOWED_AREA.y,
              RECT_ALLOWED_AREA.y + RECT_ALLOWED_AREA.height - RECT_SIZE.height,
            ),
          })}
          onDragMove={(e) => {
            setRectPos({ x: e.target.x(), y: e.target.y() });
          }}
        />

        <Rect
          x={polyRectPos.x}
          y={polyRectPos.y}
          width={POLY_RECT_SIZE.width}
          height={POLY_RECT_SIZE.height}
          fill='#06b6d4'
          stroke='#155e75'
          strokeWidth={2}
          draggable
          dragBoundFunc={(pos) => {
            if (isRectInsidePolygon(pos, POLY_RECT_SIZE, ALLOWED_POLYGON)) {
              return pos;
            }

            return polyRectPosRef.current;
          }}
          onDragMove={(e) => {
            setPolyRectPos({ x: e.target.x(), y: e.target.y() });
          }}
        />
      </Layer>
    </CanvasContainer>
  );
}
