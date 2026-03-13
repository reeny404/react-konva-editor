import type { SceneNode } from '@/types/node';

export function createRectNode(
  partial: Omit<Extract<SceneNode, { type: 'rect' }>, 'type'>,
) {
  return { type: 'rect' as const, ...partial };
}

export function createImageNode(
  partial: Omit<Extract<SceneNode, { type: 'image' }>, 'type'>,
) {
  return { type: 'image' as const, ...partial };
}

export function createSvgNode(
  partial: Omit<Extract<SceneNode, { type: 'svg' }>, 'type'>,
) {
  return { type: 'svg' as const, ...partial };
}
