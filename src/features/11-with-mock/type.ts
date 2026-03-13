import type { KonvaEventObject } from 'konva/lib/Node';
import type { useSelection } from './hooks/useSelection';

export interface SelectableNode {
  isSelected?: ReturnType<typeof useSelection>['isSelected'];
  selectOne: ReturnType<typeof useSelection>['selectOnly'];
}

export interface DraggableNode {
  draggable?: boolean;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
}
