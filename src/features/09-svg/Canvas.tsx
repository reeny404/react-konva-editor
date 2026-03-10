import { documentCommands } from '@/common/commands/documentCommands';
import Button from '@/common/components/Button';
import { useDocumentStore } from '@/common/stores/documentStore';
import { CanvasContainer } from '@/common/ui/CanvasContainer';
import { useRef } from 'react';
import { Circle, Layer, Line, Rect } from 'react-konva';
import { v4 as uuid } from 'uuid';
import CustomImage from './components/CustomImage';
import ZoomInformation from './components/ZoomInformation';
import { useGridPoints } from './hooks/useGridPoints';
import { useSelection } from './hooks/useSelection';
import { useZoomPan } from './hooks/useZoomPan';

import BOX_ICON from '@/icons/box.svg';
import CIRCLE_ICON from '@/icons/circle.svg';

const CANVAS_SIZE = { width: 3000, height: 3000 };

const FLOOR_ID = 'floor';

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

  const nodes = useDocumentStore((state) => state.doc.nodes);
  const { selectOnly, clearSelection, isSelected } = useSelection();

  const handleMouseDown = (e: Parameters<typeof zoomPanMouseDown>[0]) => {
    const stage = e.target.getStage();
    const isFloor = e.target === stage || e.target.id() === FLOOR_ID;
    if (isFloor && e.evt.button === 0) {
      clearSelection();
    }
    zoomPanMouseDown(e);
  };

  return (
    <>
      <div className='flex gap-2 p-2'>
        <Button
          className='bg-slate-200'
          onClick={() => {
            documentCommands.addNode({
              id: uuid(),
              type: 'custom-image',
              name: 'SVG Rect',
              x: Math.max(pan.x, 0),
              y: Math.max(pan.y, 0),
              width: 200,
              height: 200,
              rotation: 0,
              fill: '#0f172a',
              stroke: '#38bdf8',
              url: BOX_ICON,
            });
          }}
        >
          Add SVG Box
        </Button>
        <Button
          className='bg-slate-200'
          onClick={() => {
            documentCommands.addNode({
              id: uuid(),
              type: 'custom-image',
              name: 'SVG Circle',
              x: Math.max(pan.x, 0),
              y: Math.max(pan.y, 0),
              width: 200,
              height: 200,
              rotation: 0,
              fill: '#0f172a',
              stroke: '#38bdf8',
              url: CIRCLE_ICON,
            });
          }}
        >
          Add SVG Circle
        </Button>
      </div>

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
            id={FLOOR_ID}
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

          {nodes.map((node) => {
            if (node.type === 'rect') {
              return (
                <Rect
                  key={node.id}
                  onClick={() => selectOnly(node.id)}
                  draggable
                  onDragEnd={(e) => {
                    documentCommands.patchNode(node.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                  {...node}
                />
              );
            }
            if (node.type === 'circle') {
              return (
                <Circle
                  key={node.id}
                  onClick={() => selectOnly(node.id)}
                  draggable
                  onDragEnd={(e) => {
                    documentCommands.patchNode(node.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                  {...node}
                />
              );
            }
            if (node.type === 'custom-image') {
              return (
                <CustomImage
                  key={node.id}
                  isSelected={isSelected}
                  selectOne={selectOnly}
                  draggable
                  onDragEnd={(e) => {
                    documentCommands.patchNode(node.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                  {...node}
                />
              );
            }
            return null;
          })}
        </Layer>
      </CanvasContainer>
    </>
  );
}
