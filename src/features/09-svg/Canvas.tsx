import { CanvasContainer } from '@/common/ui/CanvasContainer';
import BOX_ICON from '@/icons/box.svg';
import { useRef } from 'react';
import { Layer, Line, Rect } from 'react-konva';
import CustomImage from './components/CustomImage';
import ZoomInformation from './components/ZoomInformation';
import { useGridPoints } from './hooks/useGridPoints';
import { useZoomPan } from './hooks/useZoomPan';

const CANVAS_SIZE = { width: 3000, height: 3000 };

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridPoints = useGridPoints(CANVAS_SIZE, 100);
  const {
    stageSize,
    scale,
    pan,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  } = useZoomPan(containerRef);

  return (
    <CanvasContainer
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
          id='canvas-floor'
          x={0}
          y={0}
          width={CANVAS_SIZE.width}
          height={CANVAS_SIZE.height}
          fill='#f8fafc'
          stroke='#0f172a'
          strokeWidth={2}
        />
        <ZoomInformation
          size={CANVAS_SIZE}
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

        <CustomImage
          url={BOX_ICON}
          x={100}
          y={100}
          width={50}
          height={50}
          draggable
        />
      </Layer>
    </CanvasContainer>
  );
}
