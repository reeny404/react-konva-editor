import { CanvasContainer } from '@/common/ui/CanvasContainer';
import BOX_ICON from '@/icons/box.svg';
import CIRCLE_ICON from '@/icons/circle.svg';
import { useRef } from 'react';
import { Layer, Line, Rect } from 'react-konva';
import CustomImage from './components/CustomImage';
import ZoomInformation from './components/ZoomInformation';
import { useGridPoints } from './hooks/useGridPoints';
import { useSelection } from './hooks/useSelection';
import { useZoomPan } from './hooks/useZoomPan';

const CANVAS_SIZE = { width: 3000, height: 3000 };

const ID = {
  floor: 'floor',
  box: 'svg-box',
  circle: 'svg-circle',
};

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const gridPoints = useGridPoints(CANVAS_SIZE, 100);
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
  const { selectOnly, clearSelection, isSelected } = useSelection();

  const handleMouseDown = (e: Parameters<typeof zoomPanMouseDown>[0]) => {
    const stage = e.target.getStage();
    const isFloor = e.target === stage || e.target.id() === ID.floor;
    if (isFloor && e.evt.button === 0) {
      clearSelection();
    }
    zoomPanMouseDown(e);
  };

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
          id={ID.floor}
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
          id={ID.box}
          url={BOX_ICON}
          x={100}
          y={100}
          width={200}
          height={200}
          draggable
          isSelected={isSelected}
          selectOne={selectOnly}
        />

        <CustomImage
          id={ID.circle}
          url={CIRCLE_ICON}
          x={100}
          y={400}
          width={200}
          height={200}
          draggable
          isSelected={isSelected}
          selectOne={selectOnly}
        />
      </Layer>
    </CanvasContainer>
  );
}
