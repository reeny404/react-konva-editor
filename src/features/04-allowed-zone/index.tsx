import useCanvasStage from '@/hooks/useCanvasStage';
import type { Position, Size } from '@/types/geometry';
import type { PolygonShape } from '@/types/shape';
import { CanvasStage } from '@/ui/CanvasStage';
import { clamp } from '@/utils/number';
import { isRectInsidePolygon } from '@/utils/validator/overlap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Rect, Text } from 'react-konva';

const RECT_ALLOWED_AREA: Size & Position = {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
};
const RECT_SIZE = { width: 90, height: 70 };
const POLY_RECT_SIZE = { width: 80, height: 60 };

const ALLOWED_POLYGON: PolygonShape = [
  { x: 760, y: 130 },
  { x: 1040, y: 100 },
  { x: 1180, y: 320 },
  { x: 980, y: 520 },
  { x: 700, y: 430 },
];

export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();

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

  const polygonPoints = useMemo(
    () => ALLOWED_POLYGON.flatMap((p) => [p.x, p.y]),
    [],
  );

  return (
    <CanvasStage
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
    </CanvasStage>
  );
}
