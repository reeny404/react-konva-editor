import { useDocumentStore } from '../stores/documentStore';
import { useSelectionStore } from '../stores/selectionStore';

export function useSelectedNode() {
  const nodes = useDocumentStore((state) => state.doc.nodes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedId = selectedIds[0];

  // MEMO: 추후 selectedIds가 여러개인 경우 고려해야 함

  return nodes.find((node) => node.id === selectedId);
}
