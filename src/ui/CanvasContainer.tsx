import type { ComponentProps, RefObject } from 'react';
import { Stage } from 'react-konva';

type Props = ComponentProps<typeof Stage> & {
  containerRef: RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
};

export function CanvasContainer({ containerRef, children, ...props }: Props) {
  return (
    <div ref={containerRef} className='relative size-full bg-slate-50'>
      <Stage {...props}>{children}</Stage>
    </div>
  );
}
