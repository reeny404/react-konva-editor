import { clearHistory, executeCommand } from '@/commands/history';
import { useDocumentStore } from '@/stores/documentStore';
import type { CanvasLayer, LayerId } from '@/types/layer';
import type { CanvasNode, NodeId } from '@/types/node';

export type CanvasLayerWithNodes = CanvasLayer & { nodes: CanvasNode[] };

export interface DocumentCommands<T extends CanvasNode = CanvasNode> {
  loadDocument(doc: {
    activeLayerId: LayerId | null;
    layers: CanvasLayerWithNodes[];
  }): void;
  patchNode(id: NodeId, next: Partial<T>): void;
  addNode(node: T): void;
  removeNode(id: NodeId): void;
}

export const documentCommands: DocumentCommands = {
  loadDocument({ activeLayerId, layers }) {
    clearHistory();

    const layerMapper = Object.fromEntries(
      layers.map((layer) => [layer.id, layer.nodes.map((node) => node.id)]),
    );

    useDocumentStore.getState().setDocument({
      activeLayerId,
      layers: Object.fromEntries(layers.map((layer) => [layer.id, layer])),
      nodes: Object.fromEntries(
        layers.flatMap((layer) => layer.nodes.map((node) => [node.id, node])),
      ),
      layerOrder: Object.values(layers).map((layer) => layer.id),
      layerMapper,
    });
  },

  patchNode(id, next) {
    const state = useDocumentStore.getState();
    const prev = state.getNode(id);
    if (!prev) {
      return;
    }

    const prevValues = Object.keys(next).reduce((acc, key) => {
      const k = key as keyof CanvasNode;
      (acc as Record<string, unknown>)[k] = prev[k];
      return acc;
    }, {} as Partial<CanvasNode>);

    executeCommand({
      do: () => state.updateNode(id, next),
      undo: () => state.updateNode(id, prevValues),
    });
  },

  addNode(node) {
    executeCommand({
      do: () => useDocumentStore.getState().addNode(node),
      undo: () => useDocumentStore.getState().removeNode(node.id),
    });
  },

  removeNode(id) {
    const node = useDocumentStore.getState().getNode(id);
    if (!node) {
      return;
    }
    executeCommand({
      do: () => useDocumentStore.getState().removeNode(id),
      undo: () => useDocumentStore.getState().addNode(node),
    });
  },
};
