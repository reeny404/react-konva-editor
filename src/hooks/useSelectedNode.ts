import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';

/**
 * MEMO: Multiple selection 미지원
 */
export function useSelectedNode() {
  const getNode = useDocumentStore((state) => state.getNode);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedId = selectedIds[0];

  if (!selectedId) {
    return undefined;
  }

  return getNode(selectedId);
}
