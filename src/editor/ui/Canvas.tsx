import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage, Text } from 'react-konva';
import { documentCommands } from '../commands/documentCommands';
import { useSelectedNode } from '../selectors/documentSelectors';
import { useDocumentStore } from '../stores/documentStore';
import { useSelectionStore } from '../stores/selectionStore';
import { useViewportStore } from '../stores/viewportStore';

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
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) {
              clearSelection();
            }
          }}
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
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={node.fill}
                  cornerRadius={12}
                  shadowColor='rgba(15, 23, 42, 0.35)'
                  shadowBlur={10}
                  shadowOffset={{ x: 0, y: 6 }}
                  shadowOpacity={0.35}
                  stroke={isSelected ? '#111827' : (node.stroke ?? '#38bdf8')}
                  strokeWidth={isSelected ? 3 : 2}
                  draggable
                  onClick={() => selectOnly(node.id)}
                  onDragStart={() => selectOnly(node.id)}
                  onDragEnd={(e) => {
                    documentCommands.moveNode(node.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                />
              );
            })}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
