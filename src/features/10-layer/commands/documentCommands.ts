import { documentCommands as baseCommands } from '@/commands/documentCommands';
import { executeCommand } from '@/commands/history';
import { documentStore } from '@/stores/documentStore';
import type { LayerId } from '@/types/layer';
import type { SceneNode } from '@/types/node';
/**
 * 10-layer 피처 테스트를 위한 확장 명령
 */
export const documentCommands = {
  ...baseCommands,

  /**
   * 테스트용: 지정된 레이어에 사각형 노드를 생성하여 추가
   */
  addRectToLayer(layerId: LayerId) {
    const layers = documentStore.getState().doc.layers;
    const totalNodes = layers.reduce(
      (sum, layer) => sum + layer.nodes.length,
      0,
    );

    const id = `rect-${Date.now()}`;
    const node: SceneNode = {
      id,
      type: 'rect',
      name: `Rect ${totalNodes + 1}`,
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      rotation: 0,
      fill: '#ffffff',
      stroke: '#0f172a',
    };

    executeCommand({
      do: () => documentStore.getState().addNode(node, layerId),
      undo: () => documentStore.getState().removeNode(node.id),
    });
  },
};
