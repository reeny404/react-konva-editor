import Button from '@/components/Button';
import CustomImage from '@/components/canvas/CustomImage';
import { SelectionTransformer } from '@/components/SelectionTransformer';
import { KEY_EDITOR_FLOOR } from '@/constants/key';
import useCanvasStage from '@/hooks/useCanvasStage';
import { CanvasStage } from '@/ui/CanvasStage';
import type Konva from 'konva';
import { Circle, Group, Layer, Rect } from 'react-konva';

import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import type { ImageNode, SceneNode } from '@/types/node';

import { selectionCommands } from '@/commands/selectionCommands';
import { documentCommands } from './commands/documentCommands';
import { layerCommands } from './commands/layerCommands';

const CANVAS_SIZE = { width: 3000, height: 3000 };

export default function Canvas() {
  const { containerRef, stageSize } = useCanvasStage();

  const layers = useDocumentStore((state) => state.doc.layers);
  const orderedLayers = [...layers].reverse();
  const activeLayerId = useDocumentStore((state) => state.activeLayerId);
  const selectedIds = useSelectionStore((state) => state.selectedIds);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.id() === KEY_EDITOR_FLOOR;

    if (clickedOnEmpty) {
      selectionCommands.clearSelection();
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex flex-wrap items-center gap-2 border-b border-slate-200 p-2'>
        <Button
          className='bg-slate-200'
          onClick={() => {
            layerCommands.addLayer();
          }}
        >
          ADD LAYER
        </Button>

        <Button
          className='bg-slate-200'
          onClick={() => {
            const topLayer = layers[layers.length - 1];
            if (!topLayer) {
              return;
            }

            documentCommands.addRectToLayer(topLayer.id);
          }}
        >
          ADD RECT TO TOP LAYER
        </Button>

        {layers.map((layer) => (
          <div
            key={layer.id}
            className='ml-2 flex items-center gap-1 rounded border border-slate-300 px-2 py-1'
          >
            <span className='text-sm font-medium'>{layer.name}</span>

            <Button
              className='bg-slate-100'
              onClick={() => layerCommands.raiseLayer(layer.id)}
            >
              Raise
            </Button>

            <Button
              className='bg-slate-100'
              onClick={() => layerCommands.lowerLayer(layer.id)}
            >
              Lower
            </Button>

            <Button
              className='bg-slate-100'
              onClick={() => layerCommands.toggleLayerLock(layer.id)}
            >
              {layer.locked ? 'Unlock' : 'Lock'}
            </Button>
          </div>
        ))}
      </div>

      <div className='relative min-h-0 flex-1'>
        {/* Layer HUD Overlay */}
        <div className='pointer-events-none absolute top-4 left-4 z-10 space-y-2'>
          <div className='rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm'>
            <h3 className='mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
              Layer Stack
            </h3>
            <div className='flex flex-col gap-1'>
              {orderedLayers.map((layer) => {
                const isActive = activeLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-2 rounded px-2 py-1 text-xs transition ${
                      isActive
                        ? 'bg-sky-500 font-bold text-white shadow-sm'
                        : 'bg-white/50 text-slate-600'
                    }`}
                  >
                    <span className='opacity-50'>
                      {layers.indexOf(layer) + 1}
                    </span>
                    <span>{layer.name}</span>
                    {layer.locked && <span className='text-[10px]'>🔒</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <CanvasStage
          containerRef={containerRef}
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
        >
          <Layer>
            <Rect
              id={KEY_EDITOR_FLOOR}
              x={0}
              y={0}
              width={CANVAS_SIZE.width}
              height={CANVAS_SIZE.height}
              fill='#f8fafc'
              stroke='#0f172a'
              strokeWidth={2}
            />

            {layers.map((layer) => {
              if (!layer.visible) {
                return null;
              }

              return (
                <Group key={layer.id} listening={!layer.locked}>
                  {layer.nodes.map((node: SceneNode) => {
                    const isSelected = selectedIds.includes(node.id);
                    const isLocked = layer.locked;

                    const selectNode = () => {
                      if (isLocked) {
                        return;
                      }
                      selectionCommands.selectOnly(node.id);
                      layerCommands.setActiveLayer(layer.id);
                    };

                    const handleMouseDown = (
                      e: Konva.KonvaEventObject<MouseEvent>,
                    ) => {
                      if (isLocked) {
                        return;
                      }

                      e.cancelBubble = true;
                      selectNode();
                    };

                    const handleDragEnd = (
                      e: Konva.KonvaEventObject<DragEvent>,
                    ) => {
                      if (isLocked) {
                        return;
                      }

                      documentCommands.patchNode(node.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    };

                    const commonProps = {
                      key: node.id,
                      id: node.id,
                      x: node.x,
                      y: node.y,
                      rotation: node.rotation ?? 0,
                      draggable: !isLocked,
                      onMouseDown: handleMouseDown,
                      onDragEnd: handleDragEnd,
                      opacity: isLocked && !isSelected ? 0.5 : 1,
                    };

                    const selectionStyle = {
                      stroke: isSelected
                        ? '#2563eb'
                        : (node.stroke ?? '#0f172a'),
                      strokeWidth: isSelected ? 3 : 1,
                    };

                    switch (node.type) {
                      case 'rect':
                        return (
                          <Rect
                            {...commonProps}
                            width={node.width}
                            height={node.height}
                            fill={node.fill}
                            {...selectionStyle}
                          />
                        );

                      case 'circle':
                        return (
                          <Circle
                            {...commonProps}
                            width={node.width}
                            height={node.height}
                            fill={node.fill}
                            {...selectionStyle}
                          />
                        );

                      case 'custom-image':
                        return (
                          <CustomImage
                            {...commonProps}
                            {...(node as ImageNode)}
                            isSelected={isSelected}
                          />
                        );

                      default:
                        return null;
                    }
                  })}
                </Group>
              );
            })}

            <SelectionTransformer />
          </Layer>
        </CanvasStage>
      </div>
    </div>
  );
}
