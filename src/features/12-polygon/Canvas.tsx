import { selectionCommands } from '@/commands/selectionCommands';
//import { SelectionTransformer } from '@/components/SelectionTransformer';
import Button from '@/components/Button';
import useCanvasStage from '@/hooks/useCanvasStage';
import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import type { PolygonPoint } from '@/types/node';
import { CanvasStage } from '@/ui/CanvasStage';
import { getAllNodesFromLayers } from '@/utils/nodeUtils';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Circle, Group, Layer, Line, Rect, Text } from 'react-konva';
import { polygonCommands } from './commands/polygonCommands';
import { usePolygonToolStore } from './stores/polygonToolStore';

function flattenPoints(points: PolygonPoint[]) {
  return points.flatMap((point) => [point.x, point.y]);
}

function getPolygonEdges(points: PolygonPoint[]) {
  return points.map((point, index) => {
    const nextIndex = (index + 1) % points.length;

    return {
      start: point,
      end: points[nextIndex],
      edgeIndex: index,
      insertIndex: index + 1,
    };
  });
}

export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();

  const layers = useDocumentStore((state) => state.doc.layers);
  const selectedIds = useSelectionStore((state) => state.selectedIds);

  const draft = usePolygonToolStore((state) => state.draft);
  const mode = usePolygonToolStore((state) => state.mode);
  const activeTool = usePolygonToolStore((state) => state.activeTool);
  const rectDraft = usePolygonToolStore((state) => state.rectDraft);

  const nodes = getAllNodesFromLayers(layers);

  const polygonNodes = nodes.filter(
    (node): node is Extract<(typeof nodes)[number], { type: 'polygon' }> =>
      node.type === 'polygon',
  );

  const draftPoints = draft.previewPoint
    ? [...draft.points, draft.previewPoint]
    : draft.points;

  const draftFlattenedPoints = flattenPoints(draftPoints);

  const handleMouseDown = (e: KonvaPointerEvent) => {
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

      if (draft.isHoveringStartPoint && draft.points.length >= 3) {
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
      if (mode.type !== 'drawing-polygon' || !draft.isDrawing) {
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
            text={`draft points: ${draft.points.length}`}
            fontSize={16}
            fill='#111827'
          />
          <Text
            x={20}
            y={108}
            text={`hovering start point: ${draft.isHoveringStartPoint ? 'true' : 'false'}`}
            fontSize={16}
            fill='#111827'
          />

          {/*완성된 polygon들*/}
          {polygonNodes.map((node) => {
            const isSelected = selectedIds.includes(node.id);
            const isEditing =
              mode.type === 'editing-polygon' && mode.nodeId === node.id;

            return (
              <Group key={node.id}>
                {/*기본 polygon 렌더링*/}
                <Line
                  id={node.id}
                  x={node.x}
                  y={node.y}
                  points={flattenPoints(node.points)}
                  closed
                  fill={node.fill}
                  stroke={isSelected ? '#111827' : (node.stroke ?? '#38bdf8')}
                  strokeWidth={isSelected ? 3 : node.strokeWidth}
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

                {/*editing일 때 렌더링. 보이지 않는 hit area*/}
                {isEditing &&
                  getPolygonEdges(node.points).map((edge) => (
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

                {/*editing일 때 렌더링. 꼭지점*/}
                {isEditing &&
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
          {rectDraft && mode.type === 'drawing-polygon-from-rect' && (
            <Rect
              x={
                rectDraft.width < 0
                  ? rectDraft.x + rectDraft.width
                  : rectDraft.x
              }
              y={
                rectDraft.height < 0
                  ? rectDraft.y + rectDraft.height
                  : rectDraft.y
              }
              width={Math.abs(rectDraft.width)}
              height={Math.abs(rectDraft.height)}
              fill='rgba(56, 189, 248, 0.1)'
              stroke='#38bdf8'
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}

          {draft.points.length > 0 && (
            <>
              <Line
                points={draftFlattenedPoints}
                stroke='#111827'
                strokeWidth={2}
                dash={[6, 4]}
                closed={false}
                lineJoin='round'
              />

              {draft.points.map((point, index) => {
                const isStartPoint = index === 0;
                const canFinish = draft.points.length >= 3; //닫을 수 있는 상태

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
                    onMouseOver={() => {
                      if (isStartPoint && canFinish) {
                        polygonCommands.setHoveringStartPoint(true);
                      }
                    }}
                    onMouseOut={() => {
                      if (isStartPoint) {
                        polygonCommands.setHoveringStartPoint(false);
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!isStartPoint || !canFinish) {
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

          {/*<SelectionTransformer />*/}
        </Layer>
      </CanvasStage>
    </>
  );
}
