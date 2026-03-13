import { documentCommands } from '@/commands/documentCommands';
import Button from '@/components/Button';
import { SelectionTransformer } from '@/components/SelectionTransformer';
import { KEY_EDITOR_FLOOR } from '@/constants/key';
import BOX_ICON from '@/icons/box.svg';
import CIRCLE_ICON from '@/icons/circle.svg';
import { useDocumentStore } from '@/stores/documentStore';
import { CanvasStage } from '@/ui/CanvasStage';
import { getAllNodesFromLayers } from '@/utils/nodeUtils';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef } from 'react';
import { Circle, Layer, Line, Rect } from 'react-konva';
import CustomImage from './components/CustomImage';
import ZoomInformation from './components/ZoomInformation';
import { useGridPoints } from './hooks/useGridPoints';
import { useSelection } from './hooks/useSelection';
import { useZoomPan } from './hooks/useZoomPan';
import { createCustomImageNode } from './initializeNode';

const CANVAS_SIZE = { width: 3000, height: 3000 };

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

  const layers = useDocumentStore((state) => state.doc.layers);
  const nodes = getAllNodesFromLayers(layers);
  const { selectOnly, clearSelection, isSelected } = useSelection();

  const handleMouseDown = (e: Parameters<typeof zoomPanMouseDown>[0]) => {
    const stage = e.target.getStage();
    const isFloor = e.target === stage || e.target.id() === KEY_EDITOR_FLOOR;
    if (isFloor && e.evt.button === 0) {
      clearSelection();
    }
    zoomPanMouseDown(e);
  };

  return (
    <>
      <div className='flex flex-wrap items-center gap-2 border-b border-slate-200 p-2'>
        <Button
          className='bg-slate-200'
          onClick={() => {
            documentCommands.addNode(
              createCustomImageNode(BOX_ICON, 'SVG Box'),
            );
          }}
        >
          ADD Box.svg
        </Button>
        <Button
          className='bg-slate-200'
          onClick={() => {
            documentCommands.addNode(
              createCustomImageNode(CIRCLE_ICON, 'SVG Circle'),
            );
          }}
        >
          ADD Circle.svg
        </Button>
      </div>

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
          <Rect
            id={KEY_EDITOR_FLOOR}
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
            const select = () => selectOnly(node.id);
            const move = (e: KonvaEventObject<DragEvent>) =>
              documentCommands.patchNode(node.id, {
                x: e.target.x(),
                y: e.target.y(),
              });

            switch (node.type) {
              case 'rect':
                return (
                  <Rect
                    key={node.id}
                    {...node}
                    onClick={select}
                    draggable
                    onDragEnd={move}
                  />
                );
              case 'circle':
                return (
                  <Circle
                    key={node.id}
                    {...node}
                    onClick={select}
                    draggable
                    onDragEnd={move}
                  />
                );
              case 'custom-image':
                return (
                  <CustomImage
                    key={node.id}
                    {...node}
                    isSelected={isSelected}
                    selectOne={selectOnly}
                    onDragEnd={move}
                    draggable
                  />
                );
              default:
                return null;
            }
          })}
          <SelectionTransformer />
        </Layer>
      </CanvasStage>
    </>
  );
}
