import { executeCommand } from '@/commands/history';
import { useLayerStore } from '@/stores/layerStore';
import type { CanvasLayer, LayerId } from '@/types/layer';

export const layerCommands = {
  setActiveLayer(id: LayerId | null) {
    useLayerStore.getState().setActiveLayer(id);
  },

  addLayer() {
    const {
      doc: { layers },
    } = useLayerStore.getState();
    const id = `layer-${Date.now()}`;
    const newLayer: CanvasLayer = {
      id,
      name: `Layer ${Object.keys(layers).length + 1}`,
      visible: true,
      locked: false,
    };

    executeCommand({
      do: () => useLayerStore.getState().addLayer(newLayer),
      undo: () => useLayerStore.getState().removeLayer(id),
    });
  },

  removeLayer(id: LayerId) {
    const {
      doc: { activeLayerId: activeId, layers, layerMapper: mapper },
      getLayer,
    } = useLayerStore.getState();

    const layer = getLayer(id);
    if (!layer) {
      return;
    }

    const prevActiveLayerId = activeId;
    const layerIndex = layers.findIndex((layer) => layer.id === id);

    executeCommand({
      do: () => useLayerStore.getState().removeLayer(id),
      undo: () => {
        const { addLayer, setActiveLayer } = useLayerStore.getState();
        addLayer({ ...layer, nodes: mapper[id] }, layerIndex);
        setActiveLayer(prevActiveLayerId);
      },
    });
  },

  raiseLayer(id: LayerId) {
    const layerOrder = useLayerStore.getState().doc.layers;
    const fromIndex = layerOrder.findIndex((layer) => layer.id === id);
    if (fromIndex === -1 || fromIndex === layerOrder.length - 1) {
      return;
    }

    const toIndex = fromIndex + 1;
    executeCommand({
      do: () => useLayerStore.getState().reorderLayer(fromIndex, toIndex),
      undo: () => useLayerStore.getState().reorderLayer(toIndex, fromIndex),
    });
  },

  lowerLayer(id: LayerId) {
    const layerOrder = useLayerStore.getState().doc.layers;
    const fromIndex = layerOrder.findIndex((layer) => layer.id === id);
    if (fromIndex === -1 || fromIndex === 0) {
      return;
    }

    const toIndex = fromIndex - 1;
    executeCommand({
      do: () => useLayerStore.getState().reorderLayer(fromIndex, toIndex),
      undo: () => useLayerStore.getState().reorderLayer(toIndex, fromIndex),
    });
  },

  toggleLayerLock(id: LayerId) {
    const layer = useLayerStore.getState().getLayer(id);
    if (!layer) {
      return;
    }

    const prevLocked = layer.locked;
    executeCommand({
      do: () =>
        useLayerStore.getState().updateLayer(id, { locked: !prevLocked }),
      undo: () =>
        useLayerStore.getState().updateLayer(id, { locked: prevLocked }),
    });
  },

  /*지금은 사용하지 않음. 추후에 레이어 가시성 토글에 필요할 수도 있어 미리 구현*/
  /*   toggleLayerVisibility(id: LayerId) {
    const layer = useLayerStore.getState().getLayerById(id);
    if (!layer) {
      return;
    }

    const prevVisible = layer.visible;
    executeCommand({
      do: () =>
        useLayerStore.getState().updateLayer(id, { visible: !prevVisible }),
      undo: () =>
        useLayerStore.getState().updateLayer(id, { visible: prevVisible }),
    });
  }, */
};
