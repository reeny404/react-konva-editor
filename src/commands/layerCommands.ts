import { executeCommand } from '@/commands/history';
import { useLayerStore } from '@/stores/layerStore';
import type { CanvasNode, NodeId } from '@/types/node';

export const layerCommands = {
  addNode(layerId: string, node: CanvasNode) {
    executeCommand({
      do: () => useLayerStore.getState().addNode(layerId, node),
      undo: () => useLayerStore.getState().removeNode(layerId, node.id),
    });
  },

  patchNode(layerId: string, nodeId: NodeId, patch: Partial<CanvasNode>) {
    const originalNode = useLayerStore.getState().getNode(layerId, nodeId);
    executeCommand({
      do: () => useLayerStore.getState().patchNode(layerId, nodeId, patch),
      undo: () => {
        if (originalNode) {
          useLayerStore.getState().patchNode(layerId, nodeId, originalNode);
        }
      },
    });
  },

  removeNode(layerId: string, nodeId: NodeId) {
    const originalNode = useLayerStore.getState().getNode(layerId, nodeId);
    executeCommand({
      do: () => useLayerStore.getState().removeNode(layerId, nodeId),
      undo: () => {
        if (originalNode) {
          useLayerStore.getState().addNode(layerId, originalNode);
        }
      },
    });
  },
};
