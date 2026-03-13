import { useSelectionStore } from '@/stores/selectionStore';
import type { NodeId } from '@/types/node';

export function useSelection() {
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectOnly = useSelectionStore((state) => state.selectOnly);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const isSelected = (id: NodeId) => selectedIds.includes(id);

  return {
    selectedIds,
    selectOnly,
    clearSelection,
    isSelected,
  };
}
