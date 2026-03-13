import type { Size } from '@/types/geometry';
import { useMemo } from 'react';

/**
 *
 * @param size
 * @param step = cell size
 * @returns
 */
export function useGridPoints({ width, height }: Size, step = 100) {
  return useMemo(() => {
    const points: number[][] = [];
    const safeStep = Math.max(step, 200);

    for (let x = 0; x <= width; x += safeStep) {
      points.push([x, 0, x, height]);
    }

    for (let y = 0; y <= height; y += safeStep) {
      points.push([0, y, width, y]);
    }

    return points;
  }, [width, height, step]);
}
