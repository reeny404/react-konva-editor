import { documentCommands } from '@/commands/documentCommands';
import { selectionCommands } from '@/commands/selectionCommands';
import { SelectionTransformer } from '@/components/SelectionTransformer';
import useCanvasStage from '@/hooks/useCanvasStage';
import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { CanvasStage } from '@/ui/CanvasStage';
import { getAllNodesFromLayers } from '@/utils/nodeUtils';
import type Konva from 'konva';
import { Layer, Rect, Text } from 'react-konva';

export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();

  const layers = useDocumentStore((state) => state.doc.layers);
  const nodes = getAllNodesFromLayers(layers);
  const selectedIds = useSelectionStore((state) => state.selectedIds);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectionCommands.clearSelection();
    }
  };

  return (
    <CanvasStage
      containerRef={containerRef}
      width={stageSize.width}
      height={stageSize.height}
      onClick={handleStageClick}
    >
      <Layer>
        <Text
          x={20}
          y={20}
          text='Editor - 요소 클릭 시 Right Panel 연동 / 배경 클릭 시 해제 / 드래그 종료 시 반영'
          fontSize={14}
          fill='#0f172a'
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
              fill={node.fill}
              stroke={isSelected ? '#3b82f6' : node.stroke}
              strokeWidth={isSelected ? 3 : 1}
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
        <SelectionTransformer />
      </Layer>
    </CanvasStage>
  );
}
