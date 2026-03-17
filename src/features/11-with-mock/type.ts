import type { KonvaEventObject } from 'konva/lib/Node';

export interface SelectableNode {
  /**
   * ID or EVENT 를 인자로 받아 처리하는게 일반적일 듯한데, konva 의 다른 node 들의 onClick 이벤트들과 동일하게 처리할 수 있도록 유형을 맞춤
   */
  onClick: () => void;
}

export interface DraggableNode {
  draggable?: boolean;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
}
