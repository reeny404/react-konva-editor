import { useEffect, useRef, useState } from 'react';

function useCanvasStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 3000, height: 3000 });

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
