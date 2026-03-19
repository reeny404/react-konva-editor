import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';

/**
 * MEMO: Multiple selection 미지원
 */
export function useSelectedNode() {
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedId = selectedIds[0];
  const nodes = useDocumentStore((state) => state.doc.nodes);

  if (!selectedId) {
    return null;
  }

  return nodes[selectedId] ?? null;
}
