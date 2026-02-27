import { CanvasContainer } from '@/common/ui/CanvasContainer';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Rect, Text } from 'react-konva';

type Position = { x: number; y: number };

const EDITOR_SIZE = { width: 3000, height: 3000 };
const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const SCALE_STEP = 1.08;

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointer, setLastPointer] = useState<Position | null>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
        setLastPointer(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const gridPoints = useMemo(() => {
    const points: number[][] = [];
    const step = 100;

    for (let x = 0; x <= EDITOR_SIZE.width; x += step) {
      points.push([x, 0, x, EDITOR_SIZE.height]);
    }

    for (let y = 0; y <= EDITOR_SIZE.height; y += step) {
      points.push([0, y, EDITOR_SIZE.width, y]);
    }

    return points;
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) {
      return;
    }

    const oldScale = scale;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const nextScale = Math.max(
      MIN_SCALE,
      Math.min(
        MAX_SCALE,
        oldScale * (direction > 0 ? SCALE_STEP : 1 / SCALE_STEP),
      ),
    );

    const mousePointTo = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    };

    setScale(nextScale);
    setPan({
      x: pointer.x - mousePointTo.x * nextScale,
      y: pointer.y - mousePointTo.y * nextScale,
    });
  };

  const startPan = (pointer: Position) => {
    setIsPanning(true);
    setLastPointer(pointer);
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) {
      return;
    }

    const isMiddleMouse = e.evt.button === 1;
    const isFloor = e.target === stage || e.target.id() === 'editor-floor';
    const isSpacePan = isSpacePressed && isFloor;

    if (!isMiddleMouse && !isSpacePan) {
      return;
    }

    e.cancelBubble = true;
    e.evt.preventDefault();
    startPan(pointer);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isPanning || !lastPointer) {
      return;
    }

    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) {
      return;
    }

    const dx = pointer.x - lastPointer.x;
    const dy = pointer.y - lastPointer.y;

    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPointer(pointer);
  };

  const endPan = () => {
    if (!isPanning) {
      return;
    }
    setIsPanning(false);
    setLastPointer(null);
  };

  const viewportLeftBottom = useMemo(() => {
    const x = (0 - pan.x) / scale;
    const y = (stageSize.height - pan.y) / scale;

    return { x, y };
  }, [pan.x, pan.y, scale, stageSize.height]);

  return (
    <CanvasContainer
      title='zoom'
      containerRef={containerRef}
      width={stageSize.width}
      height={stageSize.height}
      x={pan.x}
      y={pan.y}
      scaleX={scale}
      scaleY={scale}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endPan}
      onMouseLeave={endPan}
    >
      <Layer>
        <Rect
          id='editor-floor'
          x={0}
          y={0}
          width={EDITOR_SIZE.width}
          height={EDITOR_SIZE.height}
          fill='#f8fafc'
          stroke='#0f172a'
          strokeWidth={2}
        />

        {gridPoints.map((points, idx) => (
          <Line
            key={idx}
            points={points}
            stroke='rgba(100, 116, 139, 0.2)'
            strokeWidth={1}
            listening={false}
          />
        ))}

        <Text
          x={20}
          y={20}
          text='07-zoom | wheel: zoom | middle-drag: pan | space+drag(floor): pan'
          fontSize={18}
          fill='#0f172a'
          listening={false}
        />

        <Text
          x={20}
          y={52}
          text={`scale: ${scale.toFixed(2)} / pan: (${Math.round(pan.x)}, ${Math.round(pan.y)})`}
          fontSize={14}
          fill='#334155'
          listening={false}
        />

        <Text
          x={20}
          y={74}
          text={`visible left-bottom (editor coords): (${Math.round(viewportLeftBottom.x)}, ${Math.round(viewportLeftBottom.y)})`}
          fontSize={14}
          fill='#334155'
          listening={false}
        />

        <Text
          x={12}
          y={EDITOR_SIZE.height - 26}
          text='(0,0)'
          fontSize={14}
          fill='#0f172a'
          listening={false}
        />
      </Layer>
    </CanvasContainer>
  );
}
