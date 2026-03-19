import { SelectionTransformer } from '@/components/SelectionTransformer';
import { KEY_EDITOR_FLOOR } from '@/constants/key';
import type { Size } from '@/types/geometry';
import type { CanvasNode as CanvasNodeType } from '@/types/node';
import { CanvasStage } from '@/ui/CanvasStage';
import { useRef } from 'react';
import { Layer, Line, Rect } from 'react-konva';
import { CanvasNode } from './components/CanvasNode';
import ZoomInformation from './components/ZoomInformation';
import { useGridPoints } from './hooks/useGridPoints';
import { useSelection } from './hooks/useSelection';
import { useZoomPan } from './hooks/useZoomPan';

type Props = {
  canvasSize: Size;
  cellSize: number;
  readonly: boolean;
  nodes: CanvasNodeType[];
};

export default function Canvas({
  canvasSize,
  cellSize,
  readonly,
  nodes,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const gridPoints = useGridPoints(canvasSize, cellSize);
  const {
    stageSize,
    scale,
    pan,
    handleWheel,
    handleMouseDown: zoomPanMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  } = useZoomPan(containerRef);
  const { clearSelection } = useSelection();

  const handleMouseDown = (e: Parameters<typeof zoomPanMouseDown>[0]) => {
    const stage = e.target.getStage();
    const isFloor = e.target === stage || e.target.id() === KEY_EDITOR_FLOOR;
    if (isFloor && e.evt.button === 0) {
      clearSelection();
    }
    zoomPanMouseDown(e);
  };

  return (
    <CanvasStage
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
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Layer>
        <Rect
          id={KEY_EDITOR_FLOOR}
          x={0}
          y={0}
          width={canvasSize.width}
          height={canvasSize.height}
          fill='#f8fafc'
          stroke='#0f172a'
          strokeWidth={2}
        />
        <ZoomInformation
          size={canvasSize}
          scale={scale}
          pan={pan}
          viewportLeftBottom={{ x: 0, y: 0 }}
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
      </Layer>

      <Layer>
        {nodes.map((node) => (
          <CanvasNode key={node.id} node={node} readonly={readonly} />
        ))}
        <SelectionTransformer />
      </Layer>
    </CanvasStage>
  );
}
