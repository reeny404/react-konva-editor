import { useDocumentStore } from '@/stores/documentStore';
import type { LayerId } from '@/types/layer';
import type { CanvasNode } from '@/types/node';
import { useMemo } from 'react';

export type HydratedLayer = {
  layerId: LayerId;
  nodes: CanvasNode[];
};

export function useHydratedLayers() {
  const layers = useDocumentStore((state) => state.doc.layerOrder);
  const layerMapper = useDocumentStore((state) => state.doc.layerMapper);
  const nodes = useDocumentStore((state) => state.doc.nodes);

  const hydratedLayers = useMemo(() => {
    return layers
      .map((layerId: LayerId) => {
        const nodeIds = layerMapper[layerId];
        if (!nodeIds?.length) {
          return null;
        }

        return {
          layerId,
          nodes: nodeIds.map((nodeId) => nodes[nodeId]),
        };
      })
      .filter((layer): layer is HydratedLayer => Boolean(layer));
  }, [layers, nodes]);

  return hydratedLayers;
}
