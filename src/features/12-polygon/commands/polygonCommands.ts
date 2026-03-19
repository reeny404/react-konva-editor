import { layerCommands } from '@/commands/layerCommands'; // 새로 만든 layerCommands 사용
import { useLayerStore } from '@/stores/layerStore'; // LayerStore 사용
import type { NodeId, Point, PolygonNode } from '@/types/node';
import { v4 as uuidv4 } from 'uuid';
import { usePolygonToolStore } from '../stores/polygonToolStore';
import {
  appendPolygonPoint,
  createEmptyPolygonDraft,
  getBoundingBox,
  insertPolygonPointAt,
  rectToPolygonPoints,
  replacePolygonPointAt,
  toLocalPoints,
} from '../utils/polygonUtils';

function getNextPolygonName() {
  const state = useLayerStore.getState();
  const allNodes = state.getAllNodes();
  const polygonCount = allNodes.filter(
    (node) => node.type === 'polygon',
  ).length;

  return `Polygon ${polygonCount + 1}`;
}

function getPolygonNode(nodeId: NodeId) {
  const node = useLayerStore
    .getState()
    .getAllNodes()
    .find((n) => n.id === nodeId);
  if (!node || node.type !== 'polygon') {
    return null;
  }
  return node;
}

function generatePolygonNode(points: Point[]): PolygonNode {
  const box = getBoundingBox(points);
  return {
    id: uuidv4(),
    type: 'polygon',
    name: getNextPolygonName(),
    x: box.minX,
    y: box.minY,
    width: box.width,
    height: box.height,
    rotation: 0,
    fill: '#0f172a',
    stroke: '#38bdf8',
    strokeWidth: 2,
    points: toLocalPoints(points, box.minX, box.minY),
  };
}

export const polygonCommands = {
  // 툴 선택 (변경 없음)
  setActiveTool(tool: 'polygon-click' | 'polygon-rect') {
    usePolygonToolStore.setState({
      activeTool: tool,
      draft: createEmptyPolygonDraft(),
      rectDraft: null,
      mode: { type: 'idle' },
    });
  },

  // 방법 1: 사각형 그려서 polygon 그리는 방식
  startRectDrawing(point: Point) {
    usePolygonToolStore.setState({
      draft: createEmptyPolygonDraft(),
      rectDraft: {
        isDrawing: true,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      },
      mode: { type: 'drawing-polygon-from-rect' },
    });
  },

  updateRectDraft(point: Point) {
    const state = usePolygonToolStore.getState();

    if (state.mode.type !== 'drawing-polygon-from-rect' || !state.rectDraft) {
      return;
    }

    usePolygonToolStore.setState({
      rectDraft: {
        ...state.rectDraft,
        width: point.x - state.rectDraft.x,
        height: point.y - state.rectDraft.y,
      },
    });
  },

  finishRectDrawing() {
    const state = usePolygonToolStore.getState();

    if (state.mode.type !== 'drawing-polygon-from-rect' || !state.rectDraft) {
      return;
    }

    const { x, y, width, height } = state.rectDraft;

    if (Math.abs(width) < 5 || Math.abs(height) < 5) {
      usePolygonToolStore.setState({
        rectDraft: null,
        mode: { type: 'idle' },
      });
      return;
    }

    const absolutePoints = rectToPolygonPoints(x, y, width, height);
    const node = generatePolygonNode(absolutePoints);

    const activeLayerId = useLayerStore.getState().doc.activeLayerId;

    if (activeLayerId) {
      layerCommands.addNode(activeLayerId, node);
    }

    usePolygonToolStore.setState({
      rectDraft: null,
      mode: { type: 'idle' },
    });
  },

  // 방법 2: 점을 클릭해서 polygon 그리는 방식
  startPointDrawing() {
    usePolygonToolStore.setState((state) => ({
      ...state,
      draft: {
        ...createEmptyPolygonDraft(),
        isDrawing: true,
      },
      mode: { type: 'drawing-polygon' },
    }));
  },

  cancelPointDrawing() {
    usePolygonToolStore.setState((state) => ({
      ...state,
      draft: createEmptyPolygonDraft(),
      mode: { type: 'idle' },
    }));
  },

  appendPoint(point: Point) {
    const state = usePolygonToolStore.getState();
    const { draft, mode } = state;

    if (mode.type !== 'drawing-polygon' || !draft.isDrawing) {
      return;
    }

    usePolygonToolStore.setState({
      draft: {
        ...draft,
        points: appendPolygonPoint(draft.points, point),
      },
    });
  },

  updatePreviewPoint(point: Point) {
    const state = usePolygonToolStore.getState();
    const { draft, mode } = state;

    if (mode.type !== 'drawing-polygon' || !draft.isDrawing) {
      return;
    }

    usePolygonToolStore.setState({
      draft: {
        ...draft,
        previewPoint: point,
      },
    });
  },

  setHoveringStartPoint(isHovering: boolean) {
    const state = usePolygonToolStore.getState();

    if (state.mode.type !== 'drawing-polygon') {
      return;
    }

    usePolygonToolStore.setState({
      draft: {
        ...state.draft,
        isHoveringStartPoint: isHovering,
      },
    });
  },

  finishPointDrawing() {
    const state = usePolygonToolStore.getState();
    const { draft, mode } = state;

    if (mode.type !== 'drawing-polygon') {
      return;
    }

    if (draft.points.length < 3) {
      return;
    }

    const node = generatePolygonNode(draft.points);

    let activeLayerId = useLayerStore.getState().doc.activeLayerId;
    if (!activeLayerId) {
      const layers = useLayerStore.getState().doc.layers;
      if (layers.length > 0) {
        activeLayerId = layers[layers.length - 1].id;
      }
    }

    if (activeLayerId) {
      layerCommands.addNode(activeLayerId, node);
    } else {
      console.warn('No active layer found to add polygon node');
    }

    usePolygonToolStore.setState({
      draft: createEmptyPolygonDraft(),
      mode: { type: 'idle' },
    });
  },

  // editing mode
  startEditing(nodeId: NodeId) {
    usePolygonToolStore.setState({
      mode: { type: 'editing-polygon', nodeId },
    });
  },

  finishEditing() {
    usePolygonToolStore.setState({
      mode: { type: 'idle' },
    });
  },

  insertVertex(nodeId: NodeId, insertIndex: number, point: Point) {
    const node = getPolygonNode(nodeId);
    if (!node) {
      return;
    }

    const activeLayerId = useLayerStore.getState().doc.activeLayerId;
    if (activeLayerId) {
      layerCommands.patchNode(activeLayerId, nodeId, {
        points: insertPolygonPointAt(node.points, insertIndex, point),
      });
    }
  },

  moveVertex(nodeId: NodeId, vertexIndex: number, point: Point) {
    const node = getPolygonNode(nodeId);
    if (!node) {
      return;
    }

    const activeLayerId = useLayerStore.getState().doc.activeLayerId;
    if (activeLayerId) {
      layerCommands.patchNode(activeLayerId, nodeId, {
        points: replacePolygonPointAt(node.points, vertexIndex, point),
      });
    }
  },

  removeVertex(nodeId: NodeId, vertexIndex: number) {
    const node = getPolygonNode(nodeId);
    if (!node) {
      return;
    }

    if (node.points.length <= 3) {
      return;
    }

    const nextPoints = node.points.filter((_, index) => index !== vertexIndex);

    const activeLayerId = useLayerStore.getState().doc.activeLayerId;
    if (activeLayerId) {
      layerCommands.patchNode(activeLayerId, nodeId, {
        points: nextPoints,
      });
    }
  },
};
