import { executeCommand } from '@/commands/history';
import { useDocumentStore } from '@/stores/documentStore';
import { getNodesByLayerId } from '@/stores/selectors/documentSelectors';
import type { CanvasLayer, LayerId } from '@/types/layer';

export const layerCommands = {
  setActiveLayer(id: LayerId | null) {
    useDocumentStore.getState().setActiveLayer(id);
  },

  addLayer() {
    const id = `layer-${Date.now()}`;
    const newLayer: CanvasLayer = {
      id,
      name: `Layer ${useDocumentStore.getState().doc.layerOrder.length + 1}`,
      visible: true,
      locked: false,
    };

    executeCommand({
      do: () => useDocumentStore.getState().addLayer(newLayer),
      undo: () => useDocumentStore.getState().removeLayer(id),
    });
  },

  removeLayer(id: LayerId) {
    const state = useDocumentStore.getState();
    const layer = state.getLayer(id);
    if (!layer) {
      return;
    }

    const prevActiveLayerId = state.doc.activeLayerId;
    const layerIndex = state.doc.layerOrder.findIndex(
      (layerId) => layerId === id,
    );
    const layerNodes = getNodesByLayerId(state.doc, id);

    executeCommand({
      do: () => useDocumentStore.getState().removeLayer(id),
      undo: () => {
        const store = useDocumentStore.getState();
        store.addLayer(layer, layerIndex);
        layerNodes.forEach((node) => store.addNode(node, id));
        store.setActiveLayer(prevActiveLayerId);
      },
    });
  },

  raiseLayer(id: LayerId) {
    const layerOrder = useDocumentStore.getState().doc.layerOrder;
    const fromIndex = layerOrder.findIndex((layerId) => layerId === id);
    if (fromIndex === -1 || fromIndex === layerOrder.length - 1) {
      return;
    }

    const toIndex = fromIndex + 1;
    executeCommand({
      do: () => useDocumentStore.getState().reorderLayer(fromIndex, toIndex),
      undo: () => useDocumentStore.getState().reorderLayer(toIndex, fromIndex),
    });
  },

  lowerLayer(id: LayerId) {
    const layerOrder = useDocumentStore.getState().doc.layerOrder;
    const fromIndex = layerOrder.findIndex((layerId) => layerId === id);
    if (fromIndex === -1 || fromIndex === 0) {
      return;
    }

    const toIndex = fromIndex - 1;
    executeCommand({
      do: () => useDocumentStore.getState().reorderLayer(fromIndex, toIndex),
      undo: () => useDocumentStore.getState().reorderLayer(toIndex, fromIndex),
    });
  },

  toggleLayerLock(id: LayerId) {
    const layer = useDocumentStore.getState().getLayer(id);
    if (!layer) {
      return;
    }

    const prevLocked = layer.locked;
    executeCommand({
      do: () =>
        useDocumentStore.getState().updateLayer(id, { locked: !prevLocked }),
      undo: () =>
        useDocumentStore.getState().updateLayer(id, { locked: prevLocked }),
    });
  },

  /*지금은 사용하지 않음. 추후에 레이어 가시성 토글에 필요할 수도 있어 미리 구현*/
  /*   toggleLayerVisibility(id: LayerId) {
    const layer = useDocumentStore.getState().getLayerById(id);
    if (!layer) {
      return;
    }

    const prevVisible = layer.visible;
    executeCommand({
      do: () =>
        useDocumentStore.getState().updateLayer(id, { visible: !prevVisible }),
      undo: () =>
        useDocumentStore.getState().updateLayer(id, { visible: prevVisible }),
    });
  }, */
};
