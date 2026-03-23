import { useDocumentStore } from '@/stores/documentStore';
import { useLayerStore } from '@/stores/layerStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { NodeType, type ConnectorLineNode, type RectNode } from '@/types/node';
import { useMemo } from 'react';
import type {
  ConnectorViewModel,
  NodeLineBoxNode,
  NodeLineSelection,
} from '../types/nodeLine';
import {
  buildCurvedPath,
  buildOrthogonalPath,
  buildStraightPath,
  flattenPoints,
  getTooltipPosition,
  isRectNode,
} from '../utils/nodeLineUtils';

export function useNodeLineAdapter() {
  const layerDoc = useLayerStore((state) => state.doc);
  const documentNodes = useDocumentStore((state) => state.doc.nodes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);

  const orderedNodes = useMemo(
    () =>
      layerDoc.layers.flatMap((layer) =>
        (layerDoc.layerMapper[layer.id] ?? [])
          .map((id) => documentNodes[id])
          .filter(Boolean),
      ),
    [documentNodes, layerDoc],
  );

  const boxNodes = useMemo(
    () =>
      orderedNodes.filter(
        (node): node is NodeLineBoxNode => node.type === NodeType.Rect,
      ),
    [orderedNodes],
  );

  const connectors = useMemo(
    () =>
      orderedNodes
        .filter(
          (node): node is ConnectorLineNode =>
            node.type === NodeType.ConnectorLine,
        )
        .map((connector): ConnectorViewModel | null => {
          const pathNodes = connector.nodeIds
            .map((nodeId) => documentNodes[nodeId])
            .filter(isRectNode);

          if (pathNodes.length < 2) {
            return null;
          }

          const pointObjects =
            connector.lineStyle === 'orthogonal'
              ? buildOrthogonalPath(pathNodes)
              : connector.lineStyle === 'curved'
                ? buildCurvedPath(pathNodes)
                : buildStraightPath(pathNodes);

          return {
            id: connector.id,
            name: connector.name,
            nodeIds: connector.nodeIds,
            lineStyle: connector.lineStyle,
            stroke: connector.stroke,
            strokeWidth: connector.strokeWidth,
            tension: connector.tension ?? 0,

            dash: connector.dash ?? [],
            visible: connector.visible !== false,
            selectable: connector.selectable !== false,
            readonly: Boolean(connector.locked),
            tooltip: connector.tooltip,
            isSelected: selectedIds.includes(connector.id),
            points: flattenPoints(pointObjects),
            tooltipPosition: getTooltipPosition(pointObjects),
          };
        })
        .filter(
          (connector): connector is ConnectorViewModel => connector !== null,
        ),
    [documentNodes, orderedNodes, selectedIds],
  );

  const selection = useMemo((): NodeLineSelection => {
    const selectedId = selectedIds[0];
    if (!selectedId) {
      return { type: 'none' };
    }

    const node = documentNodes[selectedId];
    if (!node) {
      return { type: 'none' };
    }

    if (node.type === NodeType.Rect) {
      return { type: 'box', node: node as RectNode };
    }

    if (node.type === NodeType.ConnectorLine) {
      return { type: 'connector', node };
    }

    return { type: 'none' };
  }, [documentNodes, selectedIds]);

  return { boxNodes, connectors, selection, documentNodes };
}
