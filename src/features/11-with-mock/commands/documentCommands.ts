import { documentCommands as commands } from '@/commands/documentCommands';
import { buildCanvasFromDb } from '@/features/11-with-mock/adaptors/buildCanvasFromDb';
import type {
  ScenarioDb,
  SubareaDb,
} from '@/features/11-with-mock/adaptors/scenario/types';
import { useCanvasFloorStore } from '@/stores/canvasFloorStore';
import { useDocumentStore } from '@/stores/documentStore';

export const documentCommands = {
  ...commands,

  setDocumentFromScenario: (scenario: ScenarioDb, subareas: SubareaDb[]) => {
    const { document: nodes, canvasFloor } = buildCanvasFromDb(
      scenario,
      subareas,
    );

    useCanvasFloorStore.getState().setCanvasFloor(canvasFloor);
    useDocumentStore.getState().setDocument({
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
          visible: true,
          locked: false,
          nodes,
        },
      ],
    });
  },
};
