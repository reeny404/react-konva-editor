import { documentCommands } from '@/commands/documentCommands';
import { documentStore } from '@/stores/documentStore';
import type { NodeId, PolygonNode, PolygonPoint } from '@/types/node';
import { getAllNodesFromLayers } from '@/utils/nodeUtils';
import { v4 as uuidv4 } from 'uuid';
import { polygonToolStore } from '../stores/polygonToolStore';
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
  const state = documentStore.getState();
  const allNodes = getAllNodesFromLayers(state.doc.layers);
  const polygonCount = allNodes.filter(
    (node) => node.type === 'polygon',
  ).length;

  return `Polygon ${polygonCount + 1}`;
}

function getPolygonNode(nodeId: NodeId) {
  const node = documentStore.getState().getNodeById(nodeId);
  if (!node || node.type !== 'polygon') {
    return null;
  }
  return node;
}

export const polygonCommands = {
  //툴 선택
  setActiveTool(tool: 'polygon-click' | 'polygon-rect') {
    polygonToolStore.setState((prev) => ({
      ...prev,
      activeTool: tool,
      draft: createEmptyPolygonDraft(),
      rectDraft: null,
      mode: { type: 'idle' },
    }));
  },

  //사각형 그리기
  startRectDrawing(point: PolygonPoint) {
    polygonToolStore.setState((prev) => ({
      ...prev,
      draft: createEmptyPolygonDraft(),
      rectDraft: {
        isDrawing: true,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      },
      mode: { type: 'drawing-polygon-from-rect' },
    }));
  },

  updateRectDraft(point: PolygonPoint) {
    const state = polygonToolStore.getState();

    if (state.mode.type !== 'drawing-polygon-from-rect' || !state.rectDraft) {
      return;
    }

    polygonToolStore.setState((prev) => ({
      ...prev,
      rectDraft: {
        ...prev.rectDraft!,
        width: point.x - prev.rectDraft!.x,
        height: point.y - prev.rectDraft!.y,
      },
    }));
  },

  finishRectDrawing() {
    const state = polygonToolStore.getState();

    if (state.mode.type !== 'drawing-polygon-from-rect' || !state.rectDraft) {
      return;
    }

    const { x, y, width, height } = state.rectDraft;

    if (Math.abs(width) < 5 || Math.abs(height) < 5) {
      polygonToolStore.setState((prev) => ({
        ...prev,
        rectDraft: null,
        mode: { type: 'idle' },
      }));
      return;
    }

    const absolutePoints = rectToPolygonPoints(x, y, width, height);
    const box = getBoundingBox(absolutePoints);

    const node: PolygonNode = {
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
      points: toLocalPoints(absolutePoints, box.minX, box.minY),
    };

    documentCommands.addNode(node);

    polygonToolStore.setState((prev) => ({
      ...prev,
      rectDraft: null,
      mode: { type: 'idle' },
    }));
  },
  // drawing mode
  startPointDrawing() {
    polygonToolStore.setState((state) => ({
      ...state,
      draft: {
        ...createEmptyPolygonDraft(),
        isDrawing: true,
      },
      mode: { type: 'drawing-polygon' },
    }));
  },

  cancelPointDrawing() {
    polygonToolStore.setState((state) => ({
      ...state,
      draft: createEmptyPolygonDraft(),
      mode: { type: 'idle' },
    }));
  },

  appendPoint(point: PolygonPoint) {
    const state = polygonToolStore.getState();
    const { draft, mode } = state;

    if (mode.type !== 'drawing-polygon' || !draft.isDrawing) {
      return;
    }

    polygonToolStore.setState((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        points: appendPolygonPoint(prev.draft.points, point),
      },
    }));
  },

  updatePreviewPoint(point: PolygonPoint) {
    const state = polygonToolStore.getState();
    const { draft, mode } = state;

    if (mode.type !== 'drawing-polygon' || !draft.isDrawing) {
      return;
    }

    polygonToolStore.setState((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        previewPoint: point,
      },
    }));
  },

  setHoveringStartPoint(isHovering: boolean) {
    const state = polygonToolStore.getState();

    if (state.mode.type !== 'drawing-polygon') {
      return;
    }

    polygonToolStore.setState((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        isHoveringStartPoint: isHovering,
      },
    }));
  },

  finishPointDrawing() {
    const state = polygonToolStore.getState();
    const { draft, mode } = state;

    if (mode.type !== 'drawing-polygon') {
      return;
    }

    if (draft.points.length < 3) {
      return;
    }

    const box = getBoundingBox(draft.points);

    const node: PolygonNode = {
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
      points: toLocalPoints(draft.points, box.minX, box.minY),
    };

    documentCommands.addNode(node);

    polygonToolStore.setState((prev) => ({
      ...prev,
      draft: createEmptyPolygonDraft(),
      mode: { type: 'idle' },
    }));
  },

  // editing mode
  startEditing(nodeId: NodeId) {
    const node = getPolygonNode(nodeId);
    if (!node) {
      return;
    }

    polygonToolStore.setState((state) => ({
      ...state,
      draft: createEmptyPolygonDraft(),
      mode: { type: 'editing-polygon', nodeId },
    }));
  },

  finishEditing() {
    polygonToolStore.setState((state) => ({
      ...state,
      mode: { type: 'idle' },
    }));
  },

  insertVertex(nodeId: NodeId, insertIndex: number, point: PolygonPoint) {
    const node = getPolygonNode(nodeId);
    if (!node) {
      return;
    }

    documentCommands.patchNode(nodeId, {
      points: insertPolygonPointAt(node.points, insertIndex, point),
    });
  },

  moveVertex(nodeId: NodeId, vertexIndex: number, point: PolygonPoint) {
    const node = getPolygonNode(nodeId);
    if (!node) {
      return;
    }

    documentCommands.patchNode(nodeId, {
      points: replacePolygonPointAt(node.points, vertexIndex, point),
    });
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

    documentCommands.patchNode(nodeId, {
      points: nextPoints,
    });
  },
};
