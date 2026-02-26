import { useViewportStore } from '@/common/stores/viewportStore';
import type { ComponentProps, RefObject } from 'react';
import { Stage } from 'react-konva';

type Props = ComponentProps<typeof Stage> & {
  containerRef: RefObject<HTMLDivElement | null>;
  title: string;
  width: number;
  height: number;
};

export function CanvasContainer({ containerRef, children, ...props }: Props) {
  const zoom = useViewportStore((state) => state.zoom);
  const panX = useViewportStore((state) => state.panX);
  const panY = useViewportStore((state) => state.panY);

  return (
    <div ref={containerRef} className='relative size-full bg-slate-50'>
      <Stage x={panX} y={panY} scaleX={zoom} scaleY={zoom} {...props}>
        {children}
      </Stage>
    </div>
  );
}
