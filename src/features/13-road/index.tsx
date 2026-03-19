import { selectionCommands } from '@/commands/selectionCommands';
import useCanvasStage from '@/hooks/useCanvasStage';
import { CanvasStage } from '@/ui/CanvasStage';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Circle, Group, Layer, Line, Text } from 'react-konva';
import { roadCommands } from './commands/roadCommands';
import { useRoadAdapter } from './hooks/useRoadAdapter';

export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();
  const { roads, draft, mode } = useRoadAdapter();

  const handleMouseDown = (e: KonvaPointerEvent) => {
    if (e.target !== e.target.getStage()) {
      return;
    }

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) {
      return;
    }

    // 편집 모드 → 백그라운드 클릭하면 편집 종료
    if (mode.type === 'editing-road') {
      roadCommands.finishEditing();
      selectionCommands.clearSelection();
      return;
    }

    selectionCommands.clearSelection();

    // 그리기 모드가 아니라면 새 도로 시작
    if (mode.type !== 'drawing-road') {
      roadCommands.startDrawing();
    }
    roadCommands.appendPoint({ x: pos.x, y: pos.y });
  };

  const handleMouseMove = (e: KonvaPointerEvent) => {
    if (mode.type !== 'drawing-road') {
      return;
    }
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) {
      return;
    }
    roadCommands.updatePreviewPoint({ x: pos.x, y: pos.y });
  };

  const handleDblClick = (e: KonvaPointerEvent) => {
    if (e.target !== e.target.getStage()) {
      return;
    }
    if (mode.type === 'drawing-road') {
      roadCommands.finishDrawing();
    }
  };

  return (
    <>
      {/* 상태 표시 툴바 */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e2e8f0',
          fontSize: 13,
          color: '#475569',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <strong style={{ color: '#1e293b' }}>Road Test</strong>
        <span>
          mode: <code style={{ color: '#2563eb' }}>{mode.type}</code>
        </span>
        {mode.type === 'drawing-road' && (
          <span style={{ color: '#64748b' }}>
            클릭 → 점 추가 &nbsp;|&nbsp; 더블 클릭 → 완성 &nbsp;|&nbsp;
            BackGround 클릭 → 취소
          </span>
        )}
        {mode.type === 'idle' && (
          <span style={{ color: '#64748b' }}>
            빈 공간 클릭 → 새 라인 그리기 시작
          </span>
        )}
        {mode.type === 'editing-road' && (
          <span style={{ color: '#64748b' }}>
            꼭지점 드래그 → 이동 &nbsp;|&nbsp; 선분 클릭 → 점 추가 &nbsp;|&nbsp;
            우클릭 → 점 삭제 &nbsp;|&nbsp; 빈 공간 클릭 → 편집 종료
          </span>
        )}
      </div>

      <CanvasStage
        containerRef={containerRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDblClick={handleDblClick}
      >
        <Layer>
          <Text x={20} y={24} text='Road Test' fontSize={15} fill='#94a3b8' />

          {roads.map((node) => (
            <Group key={node.id}>
              {/* 도로 몸체 */}
              <Line
                id={`${node.id}-body`}
                x={node.x}
                y={node.y}
                points={node.flattenedPoints}
                stroke={node.stroke ?? '#38bdf8'}
                strokeWidth={node.strokeWidth}
                lineJoin='round'
                lineCap='round'
                hitStrokeWidth={Math.max(node.strokeWidth, 16)}
                onClick={(e) => {
                  e.cancelBubble = true;
                  selectionCommands.selectOnly(node.id);
                }}
                onDblClick={(e) => {
                  e.cancelBubble = true;
                  selectionCommands.selectOnly(node.id);
                  roadCommands.startEditing(node.id);
                }}
              />

              {/* 선택 표시 (선택되었을 때만 나타나는 중앙의 파란색 선) */}
              {node.isSelected && (
                <Line
                  x={node.x}
                  y={node.y}
                  points={node.flattenedPoints}
                  stroke='#2563eb'
                  strokeWidth={6}
                  lineJoin='round'
                  lineCap='round'
                  listening={false}
                />
              )}

              {/*  편집 모드: 선분 hit-area (클릭하면 점 삽입) */}
              {node.isEditing &&
                node.edges?.map((edge) => (
                  <Line
                    key={`edge-${edge.edgeIndex}`}
                    x={node.x}
                    y={node.y}
                    points={[
                      edge.start.x,
                      edge.start.y,
                      edge.end.x,
                      edge.end.y,
                    ]}
                    stroke='rgba(59,130,246,0.15)'
                    strokeWidth={14}
                    hitStrokeWidth={20}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      const pos = e.target.getStage()?.getPointerPosition();
                      if (!pos) {
                        return;
                      }
                      roadCommands.insertVertex(node.id, edge.insertIndex, {
                        x: pos.x - node.x,
                        y: pos.y - node.y,
                      });
                    }}
                  />
                ))}

              {/*  편집 모드: 꼭지점 핸들 */}
              {node.isEditing &&
                node.points.map((point, index) => (
                  <Circle
                    key={`vertex-${index}`}
                    x={node.x + point.x}
                    y={node.y + point.y}
                    radius={6}
                    fill='#ffffff'
                    stroke='#2563eb'
                    strokeWidth={2}
                    draggable
                    onDragMove={(e) => {
                      e.cancelBubble = true;
                      roadCommands.moveVertex(node.id, index, {
                        x: e.target.x() - node.x,
                        y: e.target.y() - node.y,
                      });
                    }}
                    onContextMenu={(e) => {
                      e.evt.preventDefault();
                      e.cancelBubble = true;
                      roadCommands.removeVertex(node.id, index);
                    }}
                  />
                ))}

              {/*  selected 표시 (편집 아닐 때) */}
              {node.isSelected &&
                !node.isEditing &&
                node.points.map((point, index) => (
                  <Circle
                    key={`sel-${index}`}
                    x={node.x + point.x}
                    y={node.y + point.y}
                    radius={4}
                    fill='#2563eb'
                    listening={false}
                  />
                ))}
            </Group>
          ))}

          {/* 그리기 중 드래프트 */}
          {draft && (
            <>
              {/* 미리보기 선 */}
              <Line
                points={draft.flattenedPoints}
                stroke='#2563eb'
                strokeWidth={2}
                dash={[8, 5]}
                lineJoin='round'
                lineCap='round'
                listening={false}
              />

              {/* 클릭된 점들 */}
              {draft.points.map((point, index) => (
                <Circle
                  key={`draft-pt-${index}`}
                  x={point.x}
                  y={point.y}
                  radius={4}
                  fill='#2563eb'
                  listening={false}
                />
              ))}
            </>
          )}
        </Layer>
      </CanvasStage>
    </>
  );
}
