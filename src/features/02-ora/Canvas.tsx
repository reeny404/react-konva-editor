import { SelectionTransformer } from '@/components/SelectionTransformer';
import { selectionCommands } from '@/commands/selectionCommands';
import useCanvasStage from '@/hooks/useCanvasStage';
import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { getAllNodesFromLayers } from '@/utils/nodeUtils';
import { CanvasStage } from '@/ui/CanvasStage';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Layer, Rect, Text } from 'react-konva';
import { documentCommands } from './commands/documentCommands';
import { useDrawing } from './hooks/useDrawing';

export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();

  const {
    tempRect,
    onMouseDown: startDrawing,
    onMouseMove,
    onMouseUp,
  } = useDrawing();
  const layers = useDocumentStore((state) => state.doc.layers);
  const nodes = getAllNodesFromLayers(layers);
  const selectedIds = useSelectionStore((state) => state.selectedIds);

  const handleMouseDown = (e: KonvaPointerEvent) => {
    if (e.target === e.target.getStage()) {
      selectionCommands.clearSelection();
      startDrawing(e);
    }
  };

  return (
    <CanvasStage
      containerRef={containerRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <Layer>
        <Text
          x={20}
          y={stageSize.height - 36}
          text='react-konva editor (drag the rectangle)'
          fontSize={14}
          fill='#64748b'
        />
        {nodes.map((node) => {
          if (node.type !== 'rect') {
            return null;
          }

          const isSelected = selectedIds.includes(node.id);

          return (
            <Rect
              key={node.id}
              id={node.id}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rotation={node.rotation ?? 0}
              fill={node.fill}
              cornerRadius={0}
              shadowColor='rgba(15, 23, 42, 0.35)'
              shadowBlur={10}
              shadowOffset={{ x: 0, y: 6 }}
              shadowOpacity={0.35}
              stroke={isSelected ? '#111827' : (node.stroke ?? '#38bdf8')}
              strokeWidth={isSelected ? 3 : 2}
              draggable
              onClick={(e) => {
                e.cancelBubble = true;
                selectionCommands.selectOnly(node.id);
              }}
              onDragStart={(e) => {
                e.cancelBubble = true;
                selectionCommands.selectOnly(node.id);
              }}
              onDragEnd={(e) => {
                documentCommands.patchNode(node.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
            />
          );
        })}

        {tempRect && (
          <Rect
            x={tempRect.w < 0 ? tempRect.x + tempRect.w : tempRect.x}
            y={tempRect.h < 0 ? tempRect.y + tempRect.h : tempRect.y}
            width={Math.abs(tempRect.w)}
            height={Math.abs(tempRect.h)}
            fill='rgba(56, 189, 248, 0.1)'
            stroke='#38bdf8'
            strokeWidth={1}
            dash={[4, 4]}
          />
        )}
        <SelectionTransformer applyPatch={documentCommands.patchNode} />
      </Layer>
    </CanvasStage>
  );
}
