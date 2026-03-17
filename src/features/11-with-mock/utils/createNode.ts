import type { CanvasNode } from '@/types/node';
import {
  NodeType,
  type GroupNode,
  type ImageNode,
  type RectNode,
  type SvgNode,
} from '@/types/node';
import { v4 as uuid } from 'uuid';
import { LOCKED_DEFAULT } from '../constant';

export function createRectNode(
  partial: Omit<RectNode, 'type' | 'id'>,
): RectNode {
  return {
    id: uuid(),
    type: NodeType.Rect,
    locked: LOCKED_DEFAULT,
    ...partial,
  };
}

export function createImageNode(
  partial: Omit<ImageNode, 'type' | 'id'>,
): ImageNode {
  return {
    type: NodeType.Image,
    locked: LOCKED_DEFAULT,
    id: uuid(),
    ...partial,
  };
}

export function createSvgNode(partial: Omit<SvgNode, 'type' | 'id'>): SvgNode {
  return {
    type: NodeType.Svg,
    locked: LOCKED_DEFAULT,
    id: uuid(),
    ...partial,
  };
}

/**
 * TODO GroupNode 속성 점검 필요
 */
export function createGroupNode(name: string, nodes: CanvasNode[]): GroupNode {
  return {
    id: uuid(),
    type: NodeType.Group,
    name,
    visible: true,
    locked: LOCKED_DEFAULT,
    children: nodes,
    rotation: 0,
    fill: '#FFFFFF',
    stroke: '#000000',
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };
}
