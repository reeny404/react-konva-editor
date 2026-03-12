import { useEffect, useRef, useState } from 'react';

function useCanvasStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    setStageSize({ width: element.clientWidth, height: element.clientHeight });
  }, []);

  return { containerRef, stageSize };
}

export default useCanvasStage;
