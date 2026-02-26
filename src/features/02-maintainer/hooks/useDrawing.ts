import { documentStore } from '@/common/stores/documentStore';
import { getRelativePointerPosition } from '@/common/utils/coordinate';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { documentCommands } from '../commands/documentCommands';

export function useDrawing() {
  const [tempRect, setTempRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const onMouseDown = (e: KonvaPointerEvent) => {
    if (e.target !== e.target.getStage()) {
      return;
    }

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (!pos) {
      return;
    }

    setTempRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onMouseMove = (e: KonvaPointerEvent) => {
    if (!tempRect) {
      return;
    }

    const stage = e.target.getStage();
    if (!stage) {
      return;
    }

    const pos = getRelativePointerPosition(stage);
    if (!pos) {
      return;
    }

    setTempRect({
      ...tempRect,
      w: pos.x - tempRect.x,
      h: pos.y - tempRect.y,
    });
  };

  const onMouseUp = (e: KonvaPointerEvent) => {
    if (!tempRect) {
      return;
    }

    const latestNodes = documentStore.getState().doc.nodes;
    const latestCount = latestNodes.length;

    if (Math.abs(tempRect.w) > 5 && Math.abs(tempRect.h) > 5) {
      documentCommands.addNode({
        id: uuidv4(),
        type: 'rect',
        name: `Rectangle ${latestCount + 1}`,
        parentId: latestCount > 0 ? latestNodes[latestCount - 1].id : undefined,
        x: tempRect.w < 0 ? tempRect.x + tempRect.w : tempRect.x,
        y: tempRect.h < 0 ? tempRect.y + tempRect.h : tempRect.y,
        width: Math.abs(tempRect.w),
        height: Math.abs(tempRect.h),
        rotation: 0,
        fill: '#0f172a',
        stroke: '#38bdf8',
      });
    }
    setTempRect(null);
  };

  return { tempRect, onMouseDown, onMouseMove, onMouseUp };
}
