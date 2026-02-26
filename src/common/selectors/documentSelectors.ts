import { useDocumentStore } from '../stores/documentStore';
import { useSelectionStore } from '../stores/selectionStore';

export function useSelectedNode() {
  const nodes = useDocumentStore((state) => state.doc.nodes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedId = selectedIds[0];

  return nodes.find((node) => node.id === selectedId);
}
