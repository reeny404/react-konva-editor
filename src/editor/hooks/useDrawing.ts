import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getRelativePointerPosition } from '../utils/coordinate';
import { documentCommands } from '../commands/documentCommands';

export function useDrawing(nodesCount: number) {
  // 드래그 중인 임시 사각형 상태 (UI 가이드용)
  const [tempRect, setTempRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const onMouseDown = (e: any) => {
    // Stage(배경)를 클릭했을 때만 그리기 시작 (도형 클릭 시 무시)
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    setTempRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onMouseMove = (e: any) => {
    if (!tempRect) return;

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    setTempRect({
      ...tempRect,
      w: pos.x - tempRect.x,
      h: pos.y - tempRect.y,
    });
  };

  const onMouseUp = () => {
    if (!tempRect) return;

    // 너무 작은 사각형(클릭 실수)은 생성하지 않음
    if (Math.abs(tempRect.w) > 5 && Math.abs(tempRect.h) > 5) {
      documentCommands.addNode({
        id: uuidv4(),
        type: 'rect',
        name: `Rectangle ${nodesCount + 1}`,
        // 음수 방향(왼쪽/위쪽) 드래그 대응 로직
        x: tempRect.w < 0 ? tempRect.x + tempRect.w : tempRect.x,
        y: tempRect.h < 0 ? tempRect.y + tempRect.h : tempRect.y,
        width: Math.abs(tempRect.w),
        height: Math.abs(tempRect.h),
        fill: '#0f172a',
        stroke: '#38bdf8',
      });
    }
    setTempRect(null); // 임시 가이드 삭제
  };

  return { tempRect, onMouseDown, onMouseMove, onMouseUp };
}