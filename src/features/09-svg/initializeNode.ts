import type { ImageNode } from '@/types/node';
import { v4 as uuid } from 'uuid';

export function createCustomImageNode(
  url: string,
  name: string = 'SVG Custom Image',
) {
  const node: ImageNode = {
    id: uuid(),
    type: 'custom-image',
    name,
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    rotation: 0,
    fill: '#66FFCC',
    stroke: '#337F66',
    url,
  };

  return node;
}
