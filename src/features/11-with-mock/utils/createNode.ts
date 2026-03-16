import type { CanvasNode } from '@/types/node';

export function createRectNode(
  partial: Omit<Extract<CanvasNode, { type: 'rect' }>, 'type'>,
) {
  return { type: 'rect' as const, ...partial };
}

export function createImageNode(
  partial: Omit<Extract<CanvasNode, { type: 'image' }>, 'type'>,
) {
  return { type: 'image' as const, ...partial };
}

export function createSvgNode(
  partial: Omit<Extract<CanvasNode, { type: 'svg' }>, 'type'>,
) {
  return { type: 'svg' as const, ...partial };
}
