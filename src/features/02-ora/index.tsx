import { selectionCommands } from '@/commands/selectionCommands';
import { SelectionTransformer } from '@/components/SelectionTransformer';
import useCanvasStage from '@/hooks/useCanvasStage';
import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import type { CanvasNode } from '@/types/node';
import { CanvasStage } from '@/ui/CanvasStage';
import type Konva from 'konva';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Group, Layer, Rect, Text } from 'react-konva';
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
  const nodeMapper = useDocumentStore((state) => state.doc.nodes);
  const nodes = Object.values(nodeMapper);
  const selectedIds = useSelectionStore((state) => state.selectedIds);

  const handleMouseDown = (e: KonvaPointerEvent) => {
    if (e.target === e.target.getStage()) {
      selectionCommands.clearSelection();
      startDrawing(e);
    }
  };

  const rootNodes = nodes.filter(
    (n) => !(n as CanvasNode & { parentId?: string }).parentId,
  );

  const renderNode = (node: CanvasNode & { parentId?: string }) => {
    if (node.type !== 'rect') {
      return null;
    }

    const children = nodes.filter(
      (n) => (n as CanvasNode & { parentId?: string }).parentId === node.id,
    );
    const isGroup = children.length > 0;
    const isSelected = selectedIds.includes(node.id);

    const handleSelect = (
      e: Konva.KonvaEventObject<MouseEvent | DragEvent>,
    ) => {
      e.cancelBubble = true;
      selectionCommands.selectOnly(node.id);
    };

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      documentCommands.patchNode(node.id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    };

    if (isGroup) {
      return (
        <Group
          key={node.id}
          id={node.id}
          x={node.x}
          y={node.y}
          draggable
          onClick={handleSelect}
          onDragStart={handleSelect}
          onDragEnd={handleDragEnd}
        >
          {/* 부모 사각형은 그룹 내부에서 0,0을 기준으로 그려집니다 */}
          <Rect
            id={`${node.id}-bg`}
            x={0}
            y={0}
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
          />
          {children.map(renderNode)}
        </Group>
      );
    }

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
        onClick={handleSelect}
        onDragStart={handleSelect}
        onDragEnd={handleDragEnd}
      />
    );
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
        {rootNodes.map(renderNode)}

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
