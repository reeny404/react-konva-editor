import { documentCommands } from '@/commands/documentCommands';
import { SelectionTransformer } from '@/components/SelectionTransformer';
import { KEY_EDITOR_FLOOR } from '@/constants/key';
import { useHydratedLayers } from '@/hooks/useDocumentSelectors';
import type { Size } from '@/types/geometry';
import { CanvasStage } from '@/ui/CanvasStage';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef } from 'react';
import { Circle, Layer, Line, Rect } from 'react-konva';
import Img from './components/Image';
import Svg from './components/Svg';
import ZoomInformation from './components/ZoomInformation';
import { useGridPoints } from './hooks/useGridPoints';
import { useSelection } from './hooks/useSelection';
import { useZoomPan } from './hooks/useZoomPan';

type Props = {
  canvasSize: Size;
  cellSize: number;
  readonly: boolean;
};

export default function Canvas({ canvasSize, cellSize, readonly }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const layers = useHydratedLayers();

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

      {layers.map((layer) => (
        <Layer key={layer.layerId}>
          {layer.nodes.map((node) => {
            const locked = readonly ? true : node.locked;
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
        </Layer>
      ))}
      <Layer>
        <SelectionTransformer />
      </Layer>
    </CanvasStage>
  );
}
