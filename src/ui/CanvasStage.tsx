import type { ComponentProps, RefObject } from 'react';
import { Stage } from 'react-konva';

type Props = ComponentProps<typeof Stage> & {
  containerRef: RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
};

/**
 * 메뉴처럼 쏙 넣어줘야해서 동일한 style로 container를 감싸주기 위해 만듬
 *
 * @returns
 */
export function CanvasStage({ containerRef, children, ...props }: Props) {
  return (
    <div
      ref={containerRef}
      role='canvas-stage'
      className='h-full w-full bg-slate-50'
    >
      <Stage {...props}>{children}</Stage>
    </div>
  );
}
