import { useSelectedNode } from '@/common/selectors/documentSelectors';
import { useViewportStore } from '@/common/stores/viewportStore';
import type { ComponentProps, RefObject } from 'react';
import { Stage } from 'react-konva';

type Props = ComponentProps<typeof Stage> & {
  containerRef: RefObject<HTMLDivElement | null>;
  title: string;
  width: number;
  height: number;
};

export function CanvasContainer({
  containerRef,
  title,
  children,
  ...props
}: Props) {
  const zoom = useViewportStore((state) => state.zoom);
  const panX = useViewportStore((state) => state.panX);
  const panY = useViewportStore((state) => state.panY);
  const selectedNode = useSelectedNode();

  return (
    <div ref={containerRef} className='relative h-full w-full bg-slate-50'>
      <div className='absolute top-4 left-4 z-10 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur'>
        <p className='text-sm font-semibold text-slate-800'>feat. {title}</p>
        <p className='mt-2 text-xs text-slate-700'>
          selected: {selectedNode?.name ?? '-'}
        </p>
        <p className='mt-1 space-x-2 text-xs text-slate-700'>
          <span>x: {Math.round(selectedNode?.x ?? 0)},</span>
          <span>y: {Math.round(selectedNode?.y ?? 0)}</span>
        </p>
      </div>

      <Stage x={panX} y={panY} scaleX={zoom} scaleY={zoom} {...props}>
        {children}
      </Stage>
    </div>
  );
}
