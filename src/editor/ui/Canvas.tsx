import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage, Text } from 'react-konva';
import { documentCommands } from '../commands/documentCommands';
import { useSelectedNode } from '../selectors/documentSelectors';
import { useDocumentStore } from '../stores/documentStore';
import { useSelectionStore } from '../stores/selectionStore';
import { useViewportStore } from '../stores/viewportStore';
import { useDrawing } from '../hooks/useDrawing';
import { SelectionTransformer } from '../components/SelectionTransformer';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const nodes = useDocumentStore((state) => state.doc.nodes);

  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectOnly = useSelectionStore((state) => state.selectOnly);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const zoom = useViewportStore((state) => state.zoom);
  const panX = useViewportStore((state) => state.panX);
  const panY = useViewportStore((state) => state.panY);

  const selectedNode = useSelectedNode();

  const { tempRect, onMouseDown: startDrawing, onMouseMove, onMouseUp } = useDrawing(nodes.length);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

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

  // 마우스 다운 핸들러: 배경 클릭 시 선택 해제 + 그리기 시작
  const handleMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection(); // 기존 배경 클릭 시 선택 해제
      startDrawing(e);  // 그리기 시작 로직 호출
    }
  };

  return (
    <div ref={containerRef} className='relative h-full w-full bg-slate-50'>
      <div className='absolute top-4 left-4 z-10 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur'>
        <p className='text-sm font-semibold text-slate-800'>Rect Editor</p>
        <p className='mt-2 text-xs text-slate-700'>
          selected: {selectedNode?.name ?? '-'}
        </p>
        <p className='mt-1 text-xs text-slate-700'>
          x: {Math.round(selectedNode?.x ?? 0)}, y:{' '}
          {Math.round(selectedNode?.y ?? 0)}
        </p>
      </div>

      {stageSize.width > 0 && stageSize.height > 0 && (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          x={panX}
          y={panY}
          scaleX={zoom}
          scaleY={zoom}
          onMouseDown={handleMouseDown}
          onMouseMove={onMouseMove}      // 그리기 이동
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
              if (node.type !== 'rect') return null;

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
                      selectOnly(node.id);
                    }}
                  onDragStart={(e) => {
                    e.cancelBubble = true; // 이벤트 전파 방지
                    selectOnly(node.id);
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

            {/* 4. 그리는 중인 임시 가이드 사각형 시각화 */}
            {tempRect && (
              <Rect
                x={tempRect.w < 0 ? tempRect.x + tempRect.w : tempRect.x}
                y={tempRect.h < 0 ? tempRect.y + tempRect.h : tempRect.y}
                width={Math.abs(tempRect.w)}
                height={Math.abs(tempRect.h)}
                fill="rgba(56, 189, 248, 0.1)" // 연한 파란색 채우기
                stroke="#38bdf8"
                strokeWidth={1}
                dash={[4, 4]} // 점선 처리
              />
            )}
            <SelectionTransformer />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
