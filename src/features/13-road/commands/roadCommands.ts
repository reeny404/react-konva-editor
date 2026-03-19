import { layerCommands } from '@/commands/layerCommands';
import { useLayerStore } from '@/stores/layerStore';
import type { NodeId, Point, RoadNode } from '@/types/node';
import { v4 as uuidv4 } from 'uuid';
import { useRoadToolStore } from '../stores/roadToolStore';
import {
  createEmptyRoadDraft,
  getBoundingBox,
  toLocalPoints,
} from '../utils/roadUtils';

function getNextRoadName() {
  const allNodes = useLayerStore.getState().getAllNodes();
  const count = allNodes.filter((n) => n.type === 'road').length;
  return `Road ${count + 1}`;
}

function getRoadNode(nodeId: NodeId): RoadNode | null {
  const node = useLayerStore
    .getState()
    .getAllNodes()
    .find((n) => n.id === nodeId);
  return node?.type === 'road' ? node : null;
}

function getActiveLayerId(): string | null {
  const { doc } = useLayerStore.getState();
  if (doc.activeLayerId) {
    return doc.activeLayerId;
  }
  const layers = doc.layers;
  return layers.length > 0 ? layers[layers.length - 1].id : null;
}

function buildRoadNode(points: Point[]): RoadNode {
  const box = getBoundingBox(points);
  return {
    id: uuidv4(),
    type: 'road',
    name: getNextRoadName(),
    x: box.minX,
    y: box.minY,
    width: box.width,
    height: box.height,
    rotation: 0,
    fill: 'transparent',
    stroke: '#38bdf8',
    strokeWidth: 20,
    points: toLocalPoints(points, box.minX, box.minY),
    closed: false,
  };
}

export const roadCommands = {
  //그리기
  startDrawing() {
    useRoadToolStore.setState({
      draft: { isDrawing: true, points: [], previewPoint: null },
      mode: { type: 'drawing-road' },
    });
  },

  appendPoint(point: Point) {
    const { mode, draft } = useRoadToolStore.getState();
    if (mode.type !== 'drawing-road') {
      return;
    }
    useRoadToolStore.setState({
      draft: { ...draft, points: [...draft.points, point] },
    });
  },

  updatePreviewPoint(point: Point) {
    const { mode, draft } = useRoadToolStore.getState();
    if (mode.type !== 'drawing-road') {
      return;
    }
    useRoadToolStore.setState({
      draft: { ...draft, previewPoint: point },
    });
  },

  finishDrawing() {
    const { mode, draft } = useRoadToolStore.getState();
    if (mode.type !== 'drawing-road') {
      return;
    }

    if (draft.points.length < 2) {
      roadCommands.cancelDrawing();
      return;
    }

    const node = buildRoadNode(draft.points);
    const layerId = getActiveLayerId();
    if (layerId) {
      layerCommands.addNode(layerId, node);
    }

    useRoadToolStore.setState({
      draft: createEmptyRoadDraft(),
      mode: { type: 'idle' },
    });
  },

  cancelDrawing() {
    useRoadToolStore.setState({
      draft: createEmptyRoadDraft(),
      mode: { type: 'idle' },
    });
  },

  // 편집

  startEditing(nodeId: NodeId) {
    useRoadToolStore.setState({ mode: { type: 'editing-road', nodeId } });
  },

  finishEditing() {
    useRoadToolStore.setState({ mode: { type: 'idle' } });
  },

  insertVertex(nodeId: NodeId, insertIndex: number, point: Point) {
    const node = getRoadNode(nodeId);
    if (!node) {
      return;
    }
    const nextPoints = [...node.points];
    nextPoints.splice(insertIndex, 0, point);

    const layerId = getActiveLayerId();
    if (layerId) {
      layerCommands.patchNode(layerId, nodeId, { points: nextPoints });
    }
  },

  moveVertex(nodeId: NodeId, index: number, point: Point) {
    const node = getRoadNode(nodeId);
    if (!node) {
      return;
    }
    const nextPoints = node.points.map((p, i) => (i === index ? point : p));

    const layerId = getActiveLayerId();
    if (layerId) {
      layerCommands.patchNode(layerId, nodeId, { points: nextPoints });
    }
  },

  removeVertex(nodeId: NodeId, index: number) {
    const node = getRoadNode(nodeId);
    if (!node || node.points.length <= 2) {
      return;
    }
    const nextPoints = node.points.filter((_, i) => i !== index);

    const layerId = getActiveLayerId();
    if (layerId) {
      layerCommands.patchNode(layerId, nodeId, { points: nextPoints });
    }
  },
};
