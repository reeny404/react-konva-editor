import { clearHistory, executeCommand } from '@/commands/history';
import { layerCommands } from '@/commands/layerCommands';
import { selectionCommands } from '@/commands/selectionCommands';
import { useDocumentStore } from '@/stores/documentStore';
import { useLayerStore } from '@/stores/layerStore';
import { useSelectionStore } from '@/stores/selectionStore';
import type { ConnectorLineStyle } from '@/types/node';
import { NodeType, type ConnectorLineNode, type NodeId } from '@/types/node';
import { createNodeLineDemo } from '../utils/nodeLineUtils';

function getActiveLayerId() {
  const { doc } = useLayerStore.getState();
  return doc.activeLayerId ?? doc.layers[0]?.id ?? null;
}

function getConnectorNode(id: NodeId): ConnectorLineNode | null {
  const node = useDocumentStore.getState().getNode(id);
  return node?.type === NodeType.ConnectorLine ? node : null;
}

function getConnectorNodes() {
  return Object.values(useDocumentStore.getState().doc.nodes).filter(
    (node): node is ConnectorLineNode => node.type === NodeType.ConnectorLine,
  );
}

export const nodeLineCommands = {
  loadDemo() {
    const demo = createNodeLineDemo();
    clearHistory();
    selectionCommands.clearSelection();
    useDocumentStore.getState().setDocument({ nodes: demo.nodes });
    useLayerStore.setState({ doc: demo.layerDoc });
  },

  resetSelection() {
    selectionCommands.clearSelection();
  },

  selectNode(id: NodeId) {
    selectionCommands.selectOnly(id);
  },

  moveBoxNode(id: NodeId, position: { x: number; y: number }) {
    const layerId = getActiveLayerId();
    if (!layerId) {
      return;
    }
    layerCommands.patchNode(layerId, id, position);
  },

  createConnector(input: {
    name: string;
    nodeIds: NodeId[];
    lineStyle: ConnectorLineStyle;
    stroke: string;
    strokeWidth: number;
    tension?: number;
    dash?: number[];
    tooltip?: string;
  }) {
    const layerId = getActiveLayerId();
    if (!layerId || input.nodeIds.length < 2) {
      return;
    }

    const id = `connector-${Date.now()}`;

    const connector: ConnectorLineNode = {
      id,
      type: NodeType.ConnectorLine,
      name: input.name,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      opacity: 100,
      locked: false,
      nodeIds: input.nodeIds,
      lineStyle: input.lineStyle,
      stroke: input.stroke,
      strokeWidth: input.strokeWidth,
      tension: input.tension ?? 0,
      dash: input.dash ?? [],
      selectable: true,
      visible: true,
      tooltip: input.tooltip ?? '',
    };

    layerCommands.addNode(layerId, connector);
    selectionCommands.selectOnly(id);
  },

  patchConnector(id: NodeId, patch: Partial<ConnectorLineNode>) {
    const layerId = getActiveLayerId();
    const connector = getConnectorNode(id);
    if (!layerId || !connector) {
      return;
    }
    const patchKeys = Object.keys(patch);
    const controlOnlyPatch = patchKeys.every((key) =>
      ['locked', 'selectable', 'visible'].includes(key),
    );

    // locked(readonly)면 제어용 필드만 수정 가능
    if (connector.locked && !controlOnlyPatch) {
      return;
    }

    layerCommands.patchNode(layerId, id, patch);
  },

  patchAllConnectors(
    patch: Pick<
      Partial<ConnectorLineNode>,
      'locked' | 'selectable' | 'visible'
    >,
  ) {
    const connectors = getConnectorNodes();
    if (connectors.length === 0) {
      return;
    }
    const previousSelectedIds = useSelectionStore.getState().selectedIds;

    const previousConnectors = connectors.map((connector) => ({
      id: connector.id,
      locked: connector.locked,
      selectable: connector.selectable,
      visible: connector.visible,
    }));

    executeCommand({
      do: () => {
        const { updateNode } = useDocumentStore.getState();
        connectors.forEach((connector) => {
          updateNode(connector.id, patch);
        });

        if (patch.selectable === false) {
          selectionCommands.clearSelection();
        }
      },
      undo: () => {
        const { updateNode } = useDocumentStore.getState();
        previousConnectors.forEach((connector) => {
          updateNode(connector.id, connector);
        });
        useSelectionStore.setState({ selectedIds: previousSelectedIds });
      },
    });
  },
};
