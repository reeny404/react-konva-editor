import { documentCommands as commands } from '@/commands/documentCommands';
import { buildCanvasFromDb } from '@/features/11-with-mock/adaptors/buildCanvasFromDb';
import type {
  ScenarioDb,
  SubareaDb,
} from '@/features/11-with-mock/adaptors/scenario/types';
import { canvasFloorStore } from '@/stores/canvasFloorStore';
import { documentStore } from '@/stores/documentStore';

export const documentCommands = {
  ...commands,

  setDocumentFromScenario: (scenario: ScenarioDb, subareas: SubareaDb[]) => {
    const { document, canvasFloor } = buildCanvasFromDb(scenario, subareas);

    canvasFloorStore.getState().setCanvasFloor(canvasFloor);
    documentStore.getState().setDocument(document);
  },
};
