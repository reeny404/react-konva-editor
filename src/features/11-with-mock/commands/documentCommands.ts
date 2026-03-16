import { documentCommands as commands } from '@/commands/documentCommands';
import { buildCanvasFromDb } from '@/features/11-with-mock/adaptors/buildCanvasFromDb';
import type {
  ScenarioDb,
  SubareaDb,
} from '@/features/11-with-mock/adaptors/scenario/types';
import { useCanvasFloorStore } from '@/stores/canvasFloorStore';
import { useDocumentStore } from '@/stores/documentStore';
import type { CanvasDocument } from '@/types/document';

const DEFAULT_LAYER_ID = 'layer-1';

function createDocument(
  nodes: Parameters<typeof commands.addNode>[0][],
): CanvasDocument {
  return {
    activeLayerId: DEFAULT_LAYER_ID,
    layerOrder: [DEFAULT_LAYER_ID],
    layers: {
      [DEFAULT_LAYER_ID]: {
        id: DEFAULT_LAYER_ID,
        name: 'Layer 1',
        visible: true,
        locked: false,
      },
    },
    nodes: Object.fromEntries(
      nodes.map((node) => [node.id, { ...node, layerId: DEFAULT_LAYER_ID }]),
    ),
    layerMapper: {
      [DEFAULT_LAYER_ID]: nodes.map((node) => node.id),
    },
  };
}

export const documentCommands = {
  ...commands,

  setDocumentFromScenario: (scenario: ScenarioDb, subareas: SubareaDb[]) => {
    const { document: nodes, canvasFloor } = buildCanvasFromDb(
      scenario,
      subareas,
    );

    useCanvasFloorStore.getState().setCanvasFloor(canvasFloor);
    useDocumentStore.getState().setDocument(createDocument(nodes));
  },
};
