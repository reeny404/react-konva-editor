import type { LayerDocument } from '@/types/document';
import {
  NodeType,
  type CanvasNode,
  type NodeId,
  type PolygonPoint,
  type RectNode,
} from '@/types/node';

export type DemoDocument = {
  nodes: Record<NodeId, CanvasNode>;
  layerDoc: LayerDocument;
};

function createRectNode(node: RectNode): RectNode {
  return node;
}

export function createNodeLineDemo(): DemoDocument {
  const nodes: CanvasNode[] = [
    createRectNode({
      id: 'node-1',
      type: NodeType.Rect,
      name: 'Node1',
      x: 120,
      y: 120,
      width: 120,
      height: 64,
      rotation: 0,
      fill: '#dbeafe',
      stroke: '#1d4ed8',
    }),
    createRectNode({
      id: 'node-2',
      type: NodeType.Rect,
      name: 'Node2',
      x: 360,
      y: 120,
      width: 140,
      height: 64,
      rotation: 0,
      fill: '#dcfce7',
      stroke: '#15803d',
    }),
    createRectNode({
      id: 'node-3',
      type: NodeType.Rect,
      name: 'Node3',
      x: 640,
      y: 120,
      width: 140,
      height: 64,
      rotation: 0,
      fill: '#fef3c7',
      stroke: '#b45309',
    }),
    createRectNode({
      id: 'node-4',
      type: NodeType.Rect,
      name: 'Node4',
      x: 400,
      y: 320,
      width: 120,
      height: 64,
      rotation: 0,
      fill: '#fae8ff',
      stroke: '#a21caf',
    }),
  ];

  return {
    nodes: Object.fromEntries(nodes.map((node) => [node.id, node])),
    layerDoc: {
      activeLayerId: 'layer-1',
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
          visible: true,
          locked: false,
        },
      ],
      layerMapper: {
        'layer-1': nodes.map((node) => node.id),
      },
    },
  };
}

export function getNodeCenter(node: RectNode): PolygonPoint {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

export function flattenPoints(points: PolygonPoint[]): number[] {
  return points.flatMap((point) => [point.x, point.y]);
}

export function buildStraightPath(nodes: RectNode[]): PolygonPoint[] {
  return nodes.map(getNodeCenter);
}

function buildOrthogonalSegment(
  start: PolygonPoint,
  end: PolygonPoint,
): PolygonPoint[] {
  const midX = start.x + (end.x - start.x) / 2;
  return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
}

export function buildOrthogonalPath(nodes: RectNode[]): PolygonPoint[] {
  if (nodes.length <= 1) {
    return nodes.map(getNodeCenter);
  }

  return nodes
    .map(getNodeCenter)
    .reduce<PolygonPoint[]>((acc, point, index, points) => {
      if (index === 0) {
        return [point];
      }

      const segment = buildOrthogonalSegment(points[index - 1], point);
      return [...acc, ...segment.slice(1)];
    }, []);
}

export function buildCurvedPath(nodes: RectNode[]): PolygonPoint[] {
  const centers = nodes.map(getNodeCenter);

  if (centers.length <= 1) {
    return centers;
  }

  if (centers.length === 2) {
    const [start, end] = centers;
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 80;
    return [start, { x: midX, y: midY }, end];
  }

  return centers;
}

export function getTooltipPosition(
  points: PolygonPoint[],
): PolygonPoint | null {
  if (points.length < 2) {
    return points[0] ?? null;
  }

  const midSegmentIndex = Math.floor((points.length - 1) / 2);
  const start = points[midSegmentIndex];
  const end = points[midSegmentIndex + 1];

  if (!start || !end) {
    return null;
  }

  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

export function isRectNode(node: CanvasNode | undefined): node is RectNode {
  return node?.type === NodeType.Rect;
}
