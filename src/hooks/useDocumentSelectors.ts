import { useDocumentStore } from '@/stores/documentStore';
import { useLayerStore } from '@/stores/layerStore';
import type { LayerId } from '@/types/layer';
import type { CanvasNode } from '@/types/node';
import { useMemo } from 'react';

export type HydratedLayer = {
  layerId: LayerId;
  nodes: CanvasNode[];
};

export function useHydratedLayers() {
  const layers = useLayerStore((state) => state.doc.layers);
  const layerMapper = useLayerStore((state) => state.doc.layerMapper);
  const nodes = useDocumentStore((state) => state.doc.nodes);

  const hydratedLayers = useMemo(() => {
    return layers
      .map((layer) => {
        const nodeIds = layerMapper[layer.id];
        if (!nodeIds?.length) {
          return null;
        }

        return {
          layerId: layer.id,
          nodes: nodeIds.map((nodeId) => nodes[nodeId]),
        };
      })
      .filter((layer): layer is HydratedLayer => Boolean(layer));
  }, [layers, nodes]);

  return hydratedLayers;
}
