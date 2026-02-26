import type { Stage } from 'konva/lib/Stage';

//줌과 팬이 적용된 상태에서 마우스의 실제 캔버스 좌표 반환
export const getRelativePointerPosition = (stage: Stage) => {
  const pointer = stage.getPointerPosition();
  if (!pointer) {
    return null;
  }

  const transform = stage.getAbsoluteTransform().copy().invert();
  return transform.point(pointer);
};
