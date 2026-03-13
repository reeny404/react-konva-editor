import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { getAllNodesFromLayers } from '@/utils/nodeUtils';

export function useSelectedNode() {
  const layers = useDocumentStore((state) => state.doc.layers);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedId = selectedIds[0];

  if (!selectedId) {
    return undefined;
  }

  const nodes = getAllNodesFromLayers(layers);
  return nodes.find((node) => node.id === selectedId);
}
