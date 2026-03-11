import type { Size } from '@/common/types';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { RefObject } from 'react';
import { useEffect, useMemo, useState } from 'react';

type Position = { x: number; y: number };

const MIN_SCALE = 0.25;
const MAX_SCALE = 10;
const SCALE_STEP = 1.08;

export function useZoomPan(containerRef: RefObject<HTMLDivElement | null>) {
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });

  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
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
  }, [containerRef]);

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

  return {
    stageSize,
    scale,
    pan,
    viewportLeftBottom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: endPan,
    handleMouseLeave: endPan,
  };
}
