import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { getNodesInRenderOrder } from '@/stores/selectors/documentSelectors';

export function useSelectedNode() {
  const doc = useDocumentStore((state) => state.doc);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedId = selectedIds[0];

  if (!selectedId) {
    return undefined;
  }

  const nodes = getNodesInRenderOrder(doc);
  return nodes.find((node) => node.id === selectedId);
}
