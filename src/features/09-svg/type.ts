import type { useSelection } from './hooks/useSelection';

export interface SelectableNode {
  isSelected?: ReturnType<typeof useSelection>['isSelected'];
  selectOne: ReturnType<typeof useSelection>['selectOnly'];
}
