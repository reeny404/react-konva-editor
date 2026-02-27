import { CanvasContainer } from '@/common/ui/CanvasContainer';
import { getRelativePointerPosition } from '@/common/utils/coordinate';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Path, Rect, Text } from 'react-konva';

type Position = { x: number; y: number };

type PolygonArea = Position[];

const CANVAS_SIZE = { width: 3000, height: 3000 };
const RECT_SIZE = { width: 90, height: 70 };
const POLY_RECT_SIZE = { width: 80, height: 60 };
const BACKDROP_TEST_RECT_SIZE = { width: 140, height: 90 };

const ALLOWED_POLYGON: PolygonArea = [
  { x: 760, y: 130 },
  { x: 1040, y: 100 },
  { x: 1180, y: 320 },
  { x: 980, y: 520 },
  { x: 700, y: 430 },
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

  const [rectPos, setRectPos] = useState<Position>({ x: 840, y: 180 });
  const [polyRectPos, setPolyRectPos] = useState<Position>({ x: 860, y: 220 });
  const [backdropTestRectPos, setBackdropTestRectPos] = useState<Position>({
    x: 120,
    y: 640,
  });
  const [backdropTestClicks, setBackdropTestClicks] = useState(0);

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
  const polygonPathData = useMemo(() => {
    const [first, ...rest] = ALLOWED_POLYGON;
    if (!first) {
      return '';
    }
    return `M${first.x} ${first.y} ${rest
      .map((point) => `L${point.x} ${point.y}`)
      .join(' ')} Z`;
  }, []);
  const backdropPathData = useMemo(() => {
    return `M0 0 H${CANVAS_SIZE.width} V${CANVAS_SIZE.height} H0 Z ${polygonPathData}`;
  }, [polygonPathData]);

  const isAllowedPoint = (point: Position) =>
    isPointInPolygon(point, ALLOWED_POLYGON);
  const isRectInteractive = (
    pos: Position,
    size: { width: number; height: number },
  ) => isRectInsidePolygon(pos, size, ALLOWED_POLYGON);

  const canInteractMainRect = isRectInteractive(rectPos, RECT_SIZE);
  const canInteractPolyRect = isRectInteractive(polyRectPos, POLY_RECT_SIZE);
  const canInteractBackdropTestRect = isRectInteractive(
    backdropTestRectPos,
    BACKDROP_TEST_RECT_SIZE,
  );

  const blockOutsideAllowedZone = (
    e: KonvaEventObject<MouseEvent | TouchEvent | WheelEvent>,
  ) => {
    const stage = e.target.getStage();
    if (!stage) {
      return;
    }

    const point = getRelativePointerPosition(stage);
    if (!point || isAllowedPoint(point)) {
      return;
    }

    e.cancelBubble = true;
    e.evt.preventDefault();
  };

  return (
    <CanvasContainer
      containerRef={containerRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={blockOutsideAllowedZone}
      onMouseUp={blockOutsideAllowedZone}
      onMouseMove={blockOutsideAllowedZone}
      onClick={blockOutsideAllowedZone}
      onTap={blockOutsideAllowedZone}
      onDblClick={blockOutsideAllowedZone}
      onWheel={blockOutsideAllowedZone}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={CANVAS_SIZE.width}
          height={CANVAS_SIZE.height}
          fill='#f8fafc'
          stroke='#cbd5e1'
          strokeWidth={2}
        />

        <Path
          data={backdropPathData}
          fill='rgba(15, 23, 42, 0.2)'
          fillRule='evenodd'
          listening={false}
        />

        <Text
          x={20}
          y={20}
          text='allowed-zone-backdrop (polygon readonly outside)'
          fontSize={16}
          fill='#0f172a'
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
          text='다각형 허용 영역 (외부는 readonly)'
          fontSize={14}
          fill='#0e7490'
        />

        <Text
          x={120}
          y={606}
          text={`backdrop test rect clicks: ${backdropTestClicks} (${canInteractBackdropTestRect ? 'interactive' : 'readonly'})`}
          fontSize={14}
          fill='#7f1d1d'
        />

        <Rect
          x={backdropTestRectPos.x}
          y={backdropTestRectPos.y}
          width={BACKDROP_TEST_RECT_SIZE.width}
          height={BACKDROP_TEST_RECT_SIZE.height}
          fill='rgba(220, 38, 38, 0.8)'
          stroke='#7f1d1d'
          strokeWidth={2}
          opacity={canInteractBackdropTestRect ? 1 : 0.55}
          listening={canInteractBackdropTestRect}
          draggable={canInteractBackdropTestRect}
          onClick={() => {
            setBackdropTestClicks((prev) => prev + 1);
          }}
          onDragMove={(e) => {
            setBackdropTestRectPos({ x: e.target.x(), y: e.target.y() });
          }}
        />

        <Rect
          x={rectPos.x}
          y={rectPos.y}
          width={RECT_SIZE.width}
          height={RECT_SIZE.height}
          fill='#22c55e'
          stroke='#166534'
          strokeWidth={2}
          listening={canInteractMainRect}
          draggable={canInteractMainRect}
          dragBoundFunc={(pos) => {
            if (isRectInsidePolygon(pos, RECT_SIZE, ALLOWED_POLYGON)) {
              return pos;
            }

            return rectPosRef.current;
          }}
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
          listening={canInteractPolyRect}
          draggable={canInteractPolyRect}
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
