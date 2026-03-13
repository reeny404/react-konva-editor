import { documentCommands } from '@/commands/documentCommands';
import { SelectionTransformer } from '@/components/SelectionTransformer';
import useCanvasStage from '@/hooks/useCanvasStage';
import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { selectionCommands } from '@/commands/selectionCommands';
import { CanvasStage } from '@/ui/CanvasStage';
import { getAllNodesFromLayers } from '@/utils/nodeUtils';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Layer, Rect, Text } from 'react-konva';
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

  // 마우스 다운 핸들러: 배경 클릭 시 선택 해제 + 그리기 시작
  const handleMouseDown = (e: KonvaPointerEvent) => {
    if (e.target === e.target.getStage()) {
      selectionCommands.clearSelection(); // 기존 배경 클릭 시 선택 해제
      startDrawing(e); // 그리기 시작 로직 호출
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
                e.cancelBubble = true; // 이벤트 전파 방지 (Stage 클릭 방지)
                selectionCommands.selectOnly(node.id);
              }}
              onDragStart={(e) => {
                e.cancelBubble = true; // 이벤트 전파 방지
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

        {/* 4. 그리는 중인 임시 가이드 사각형 시각화 */}
        {tempRect && (
          <Rect
            x={tempRect.w < 0 ? tempRect.x + tempRect.w : tempRect.x}
            y={tempRect.h < 0 ? tempRect.y + tempRect.h : tempRect.y}
            width={Math.abs(tempRect.w)}
            height={Math.abs(tempRect.h)}
            fill='rgba(56, 189, 248, 0.1)' // 연한 파란색 채우기
            stroke='#38bdf8'
            strokeWidth={1}
            dash={[4, 4]} // 점선 처리
          />
        )}
        <SelectionTransformer />
      </Layer>
    </CanvasStage>
  );
}
