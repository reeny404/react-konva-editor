import { documentCommands } from '@/commands/documentCommands';
import Button from '@/components/Button';
import {
  canvasFloorStore,
  useCanvasFloorStore,
} from '@/stores/canvasFloorStore';
import { documentStore, useDocumentStore } from '@/stores/documentStore';
import { useRef, useState } from 'react';
import { Circle, Layer, Line, Rect } from 'react-konva';
import Svg from './components/Svg';
import ZoomInformation from './components/ZoomInformation';
import { useGridPoints } from './hooks/useGridPoints';
import { useSelection } from './hooks/useSelection';
import { useZoomPan } from './hooks/useZoomPan';

import { SelectionTransformer } from '@/components/SelectionTransformer';
import { KEY_EDITOR_FLOOR } from '@/constants/key';
import { CanvasStage } from '@/ui/CanvasStage';
import type { KonvaEventObject } from 'konva/lib/Node';
import { buildCanvasFromDb } from './adaptors/buildCanvasFromDb';
import { loadMockScenario } from './adaptors/loadMockScenario';
import Img from './components/Image';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [draggable, setDraggable] = useState<boolean>(false);

  const { size: canvasSize, cellSize } = useCanvasFloorStore(
    (state) => state.floor,
  );
  const nodes = useDocumentStore((state) => state.doc.nodes);

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
          onClick={() => {
            const { scenario, subareas } = loadMockScenario();
            const { document, canvasFloor } = buildCanvasFromDb(
              scenario,
              subareas,
            );
            canvasFloorStore.getState().setCanvasFloor(canvasFloor);
            documentStore.getState().setDocument(document);
          }}
        >
          Mock 데이터 로드
        </Button>
        <Button
          className={draggable ? 'bg-slate-300' : 'font-bold'}
          onClick={() => setDraggable((prev) => !prev)}
        >
          Locked: {draggable ? 'ON' : 'OFF'}
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

          {nodes.map((node) => {
            const locked = draggable ? true : node.locked;
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
                    onClick={select}
                    onDragEnd={move}
                    draggable={!locked}
                    {...node}
                  />
                );
              case 'circle':
                return (
                  <Circle
                    key={node.id}
                    onClick={select}
                    onDragEnd={move}
                    draggable={!locked}
                    {...node}
                  />
                );
              case 'svg':
                return (
                  <Svg
                    key={node.id}
                    isSelected={isSelected}
                    selectOne={selectOnly}
                    onDragEnd={move}
                    draggable={!locked}
                    {...node}
                  />
                );
              case 'image': {
                return (
                  <Img
                    key={node.id}
                    isSelected={isSelected}
                    selectOne={selectOnly}
                    onDragEnd={move}
                    draggable={!locked}
                    {...node}
                  />
                );
              }
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
