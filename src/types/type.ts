import type { KonvaEventObject } from 'konva/lib/Node';

export interface SelectableNode {
  isSelected?: (id: string) => boolean;
  selectOne: (id: string) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
}

export interface DraggableNode {
  draggable?: boolean;
  onDragStart?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
}
