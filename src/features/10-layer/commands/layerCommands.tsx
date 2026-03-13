import { executeCommand } from '@/commands/history';
import { documentStore } from '@/stores/documentStore';
import type { DocumentLayer, LayerId } from '@/types/layer';

export const layerCommands = {
  setActiveLayer(id: LayerId | null) {
    documentStore.getState().setActiveLayer(id);
  },

  addLayer() {
    const id = `layer-${Date.now()}`;
    const newLayer: DocumentLayer = {
      id,
      name: `Layer ${documentStore.getState().doc.layers.length + 1}`,
      visible: true,
      locked: false,
      nodes: [],
    };

    executeCommand({
      do: () => documentStore.getState().addLayer(newLayer),
      undo: () => documentStore.getState().removeLayer(id),
    });
  },

  removeLayer(id: LayerId) {
    const layer = documentStore.getState().getLayerById(id);
    if (!layer) {
      return;
    }

    executeCommand({
      do: () => documentStore.getState().removeLayer(id),
      undo: () => documentStore.getState().addLayer(layer),
    });
  },

  raiseLayer(id: LayerId) {
    const layers = documentStore.getState().doc.layers;
    const fromIndex = layers.findIndex((l) => l.id === id);
    if (fromIndex === -1 || fromIndex === layers.length - 1) {
      return;
    }

    const toIndex = fromIndex + 1;
    executeCommand({
      do: () => documentStore.getState().reorderLayer(fromIndex, toIndex),
      undo: () => documentStore.getState().reorderLayer(toIndex, fromIndex),
    });
  },

  lowerLayer(id: LayerId) {
    const layers = documentStore.getState().doc.layers;
    const fromIndex = layers.findIndex((l) => l.id === id);
    if (fromIndex === -1 || fromIndex === 0) {
      return;
    }

    const toIndex = fromIndex - 1;
    executeCommand({
      do: () => documentStore.getState().reorderLayer(fromIndex, toIndex),
      undo: () => documentStore.getState().reorderLayer(toIndex, fromIndex),
    });
  },

  toggleLayerLock(id: LayerId) {
    const layer = documentStore.getState().getLayerById(id);
    if (!layer) {
      return;
    }

    const prevLocked = layer.locked;
    executeCommand({
      do: () =>
        documentStore.getState().updateLayer(id, { locked: !prevLocked }),
      undo: () =>
        documentStore.getState().updateLayer(id, { locked: prevLocked }),
    });
  },

  /*지금은 사용하지 않음. 추후에 레이어 가시성 토글에 필요할 수도 있어 미리 구현*/
  /*   toggleLayerVisibility(id: LayerId) {
    const layer = documentStore.getState().getLayerById(id);
    if (!layer) {
      return;
    }

    const prevVisible = layer.visible;
    executeCommand({
      do: () =>
        documentStore.getState().updateLayer(id, { visible: !prevVisible }),
      undo: () =>
        documentStore.getState().updateLayer(id, { visible: prevVisible }),
    });
  }, */
};
