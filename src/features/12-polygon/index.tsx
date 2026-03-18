import { selectionCommands } from '@/commands/selectionCommands';
import Button from '@/components/Button';
import useCanvasStage from '@/hooks/useCanvasStage';
import { CanvasStage } from '@/ui/CanvasStage';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Circle, Group, Layer, Line, Rect, Text } from 'react-konva';
import { polygonCommands } from './commands/polygonCommands';
import { usePolygonAdapter } from './hooks/usePolygonAdapter';

/**
 * 이 컴포넌트는 usePolygonAdapter로부터 가공된 ViewModel을 주입받아
 * 화면에 그리는 역할에만 집중합니다.
 */
export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();

  //Adapter를 통해 Store 데이터를 Canvas 전용 ViewModel로 변환
  const { polygons, draft, rectDraft, activeTool, mode } = usePolygonAdapter();

  const handleMouseDown = (e: KonvaPointerEvent) => {
    console.log('mouseDown target:', e.target);
    console.log('isStage:', e.target === e.target.getStage());
    if (e.target !== e.target.getStage()) {
      return;
    }

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) {
      return;
    }

    if (mode.type === 'editing-polygon') {
      selectionCommands.clearSelection();
      polygonCommands.finishEditing();
      return;
    }

    selectionCommands.clearSelection();

    if (activeTool === 'polygon-click') {
      if (mode.type !== 'drawing-polygon') {
        polygonCommands.startPointDrawing();
        polygonCommands.appendPoint({ x: pos.x, y: pos.y });
        return;
      }

      if (draft?.isHoveringStartPoint && draft?.canFinish) {
        polygonCommands.finishPointDrawing();
        return;
      }

      polygonCommands.appendPoint({ x: pos.x, y: pos.y });
      return;
    }

    if (activeTool === 'polygon-rect') {
      if (mode.type !== 'drawing-polygon-from-rect') {
        polygonCommands.startRectDrawing({ x: pos.x, y: pos.y });
      }
    }
  };

  const handleMouseMove = (e: KonvaPointerEvent) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) {
      return;
    }

    if (activeTool === 'polygon-click') {
      if (mode.type !== 'drawing-polygon' || !draft?.isDrawing) {
        return;
      }

      polygonCommands.updatePreviewPoint({ x: pos.x, y: pos.y });
      return;
    }

    if (activeTool === 'polygon-rect') {
      if (mode.type !== 'drawing-polygon-from-rect') {
        return;
      }

      polygonCommands.updateRectDraft({ x: pos.x, y: pos.y });
    }
  };

  const handleMouseUp = () => {
    if (activeTool !== 'polygon-rect') {
      return;
    }

    if (mode.type !== 'drawing-polygon-from-rect') {
      return;
    }

    polygonCommands.finishRectDrawing();
  };

  return (
    <>
      <div className='flex flex-wrap items-center gap-2 border-b border-slate-200 p-2'>
        <Button
          className='bg-slate-200'
          onClick={() => polygonCommands.setActiveTool('polygon-click')}
        >
          점 기반 polygon
        </Button>
        <Button
          className='bg-slate-200'
          onClick={() => polygonCommands.setActiveTool('polygon-rect')}
        >
          rect 기반 polygon
        </Button>
      </div>
      <CanvasStage
        containerRef={containerRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Text x={20} y={32} text='polygon test' fontSize={18} fill='blue' />
          <Text
            x={20}
            y={60}
            text={`mode: ${mode.type}`}
            fontSize={16}
            fill='#111827'
          />
          <Text
            x={20}
            y={84}
            text={`draft points: ${draft?.points.length ?? 0}`}
            fontSize={16}
            fill='#111827'
          />
          <Text
            x={20}
            y={108}
            text={`hovering start point: ${draft?.isHoveringStartPoint ? 'true' : 'false'}`}
            fontSize={16}
            fill='#111827'
          />

          {/* 완성된 polygon들 렌더링 */}
          {polygons.map((node) => {
            return (
              <Group key={node.id}>
                {/* 기본 polygon 렌더링 */}
                <Line
                  id={node.id}
                  x={node.x}
                  y={node.y}
                  points={node.flattenedPoints}
                  closed
                  fill={node.fill}
                  stroke={
                    node.isSelected ? '#111827' : (node.stroke ?? '#38bdf8')
                  }
                  strokeWidth={node.isSelected ? 3 : node.strokeWidth}
                  lineJoin='round'
                  onClick={(e) => {
                    e.cancelBubble = true;
                    selectionCommands.selectOnly(node.id);
                  }}
                  onDblClick={(e) => {
                    e.cancelBubble = true;
                    selectionCommands.selectOnly(node.id);
                    polygonCommands.startEditing(node.id);
                  }}
                />

                {/* editing 모드일 때 에지 렌더링 (hit area) */}
                {node.isEditing &&
                  node.edges?.map((edge) => (
                    <Line
                      key={`${node.id}-edge-${edge.edgeIndex}`}
                      x={node.x}
                      y={node.y}
                      points={[
                        edge.start.x,
                        edge.start.y,
                        edge.end.x,
                        edge.end.y,
                      ]}
                      stroke='rgba(59,130,246,0.001)'
                      strokeWidth={16}
                      onClick={(e) => {
                        e.cancelBubble = true;

                        const stage = e.target.getStage();
                        const pos = stage?.getPointerPosition();
                        if (!pos) {
                          return;
                        }

                        polygonCommands.insertVertex(
                          node.id,
                          edge.insertIndex,
                          {
                            x: pos.x - node.x,
                            y: pos.y - node.y,
                          },
                        );
                      }}
                    />
                  ))}

                {/* editing 모드일 때 꼭지점 렌더링 */}
                {node.isEditing &&
                  node.points.map((point, index) => (
                    <Circle
                      key={`${node.id}-vertex-${index}`}
                      x={node.x + point.x}
                      y={node.y + point.y}
                      radius={6}
                      fill='#ffffff'
                      stroke='#111827'
                      strokeWidth={1}
                      draggable
                      onDragMove={(e) => {
                        e.cancelBubble = true;

                        polygonCommands.moveVertex(node.id, index, {
                          x: e.target.x() - node.x,
                          y: e.target.y() - node.y,
                        });
                      }}
                      onContextMenu={(e) => {
                        e.evt.preventDefault();
                        e.cancelBubble = true;

                        polygonCommands.removeVertex(node.id, index);
                      }}
                    />
                  ))}
              </Group>
            );
          })}

          {/* rect 기반 생성 중 임시 가이드 */}
          {rectDraft && (
            <Rect
              x={rectDraft.x}
              y={rectDraft.y}
              width={rectDraft.width}
              height={rectDraft.height}
              fill='rgba(56, 189, 248, 0.1)'
              stroke='#38bdf8'
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}

          {/* 점 기반 생성 중인 Draft 렌더링 */}
          {draft && (
            <>
              <Line
                points={draft.flattenedPoints}
                stroke='#111827'
                strokeWidth={2}
                dash={[6, 4]}
                closed={false}
                lineJoin='round'
              />

              {draft.points.map((point, index) => {
                const isStartPoint = index === 0;
                const enableStartPointInteraction =
                  isStartPoint && draft.canFinish;

                return (
                  <Circle
                    key={`draft-point-${index}`}
                    x={point.x}
                    y={point.y}
                    radius={isStartPoint ? 8 : 5}
                    fill={
                      isStartPoint
                        ? draft.isHoveringStartPoint
                          ? '#22c55e'
                          : '#ef4444'
                        : '#ffffff'
                    }
                    stroke='#111827'
                    strokeWidth={1}
                    hitStrokeWidth={24}
                    listening={enableStartPointInteraction}
                    onMouseOver={() => {
                      if (enableStartPointInteraction) {
                        polygonCommands.setHoveringStartPoint(true);
                      }
                    }}
                    onMouseOut={() => {
                      if (enableStartPointInteraction) {
                        polygonCommands.setHoveringStartPoint(false);
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!enableStartPointInteraction) {
                        return;
                      }

                      e.cancelBubble = true;
                      polygonCommands.finishPointDrawing();
                    }}
                  />
                );
              })}
            </>
          )}
        </Layer>
      </CanvasStage>
    </>
  );
}
