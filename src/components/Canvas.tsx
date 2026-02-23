import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage, Text } from 'react-konva';

type RectState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const INITIAL_RECT: RectState = {
  x: 120,
  y: 90,
  width: 180,
  height: 120,
};

export function Canvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [rect, setRect] = useState<RectState>(INITIAL_RECT);

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
        <p className='mt-1 text-xs text-slate-500'>드래그해서 이동하세요</p>
        <p className='mt-2 text-xs text-slate-700'>
          x: {Math.round(rect.x)}, y: {Math.round(rect.y)}
        </p>
      </div>

      {stageSize.width > 0 && stageSize.height > 0 && (
        <Stage width={stageSize.width} height={stageSize.height}>
          <Layer>
            <Text
              x={20}
              y={stageSize.height - 36}
              text='react-konva editor (drag the rectangle)'
              fontSize={14}
              fill='#64748b'
            />
            <Rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill='#0f172a'
              cornerRadius={12}
              shadowColor='rgba(15, 23, 42, 0.35)'
              shadowBlur={10}
              shadowOffset={{ x: 0, y: 6 }}
              shadowOpacity={0.35}
              stroke='#38bdf8'
              strokeWidth={2}
              draggable
              onDragMove={(e) => {
                setRect((prev) => ({
                  ...prev,
                  x: e.target.x(),
                  y: e.target.y(),
                }));
              }}
            />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
