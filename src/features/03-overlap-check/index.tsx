import useCanvasStage from '@/hooks/useCanvasStage';
import { CanvasStage } from '@/ui/CanvasStage';
import Konva from 'konva';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Rect, Text } from 'react-konva';

type NodeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();
  const rectARef = useRef<Konva.Rect | null>(null);
  const rectBRef = useRef<Konva.Rect | null>(null);

  const [rectA, setRectA] = useState<NodeRect>({
    x: 180,
    y: 140,
    width: 260,
    height: 180,
    fill: 'rgba(14, 116, 144, 0.55)',
  });

  const [rectB, setRectB] = useState<NodeRect>({
    x: 420,
    y: 230,
    width: 260,
    height: 180,
    fill: 'rgba(217, 119, 6, 0.55)',
  });

  const [isOverlapping, setIsOverlapping] = useState(false);

  const checkOverlap = () => {
    const nodeA = rectARef.current;
    const nodeB = rectBRef.current;
    if (!nodeA || !nodeB) {
      return;
    }

    const hasIntersection = Konva.Util.haveIntersection(
      nodeA.getClientRect(),
      nodeB.getClientRect(),
    );

    setIsOverlapping(hasIntersection);
  };

  useEffect(() => {
    checkOverlap();
  }, [rectA, rectB]);

  const status = useMemo(() => {
    return isOverlapping ? '겹침: YES' : '겹침: NO';
  }, [isOverlapping]);

  return (
    <CanvasStage
      containerRef={containerRef}
      width={stageSize.width}
      height={stageSize.height}
    >
      <Layer>
        <Text
          x={20}
          y={20}
          text='A/B 드래그: 겹침 여부를 실시간 체크'
          fontSize={16}
          fill='#0f172a'
        />
        <Text
          x={20}
          y={46}
          text={status}
          fontSize={16}
          fontStyle='bold'
          fill={isOverlapping ? '#b91c1c' : '#065f46'}
        />

        <Rect
          ref={rectARef}
          x={rectA.x}
          y={rectA.y}
          width={rectA.width}
          height={rectA.height}
          fill={rectA.fill}
          stroke={isOverlapping ? '#dc2626' : '#0e7490'}
          strokeWidth={3}
          draggable
          onDragMove={(e) => {
            setRectA((prev) => ({
              ...prev,
              x: e.target.x(),
              y: e.target.y(),
            }));
          }}
        />

        <Rect
          ref={rectBRef}
          x={rectB.x}
          y={rectB.y}
          width={rectB.width}
          height={rectB.height}
          fill={rectB.fill}
          stroke={isOverlapping ? '#dc2626' : '#d97706'}
          strokeWidth={3}
          draggable
          onDragMove={(e) => {
            setRectB((prev) => ({
              ...prev,
              x: e.target.x(),
              y: e.target.y(),
            }));
          }}
        />
      </Layer>
    </CanvasStage>
  );
}
