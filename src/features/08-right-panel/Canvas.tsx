import { documentCommands } from '@/common/commands/documentCommands';
import { useDocumentStore } from '@/common/stores/documentStore';
import { useSelectionStore } from '@/common/stores/selectionStore';
import { CanvasContainer } from '@/common/ui/CanvasContainer';
import type Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Text } from 'react-konva';
import { selectionCommands } from './commands/selectionCommands';
import { SelectionTransformer } from './components/SelectionTransformer';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const nodes = useDocumentStore((state) => state.doc.nodes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setStageSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectionCommands.clearSelection();
    }
  };

  return (
    <CanvasContainer
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
                documentCommands.moveNode(node.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
            />
          );
        })}

        <SelectionTransformer />
      </Layer>
    </CanvasContainer>
  );
}
