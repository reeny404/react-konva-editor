import { NodeType, type SvgNode } from '@/types/node';
import { v4 as uuid } from 'uuid';

export function createCustomImageNode(
  url: string,
  name: string = 'SVG Custom Image',
): SvgNode {
  return {
    id: uuid(),
    type: NodeType.Svg,
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
}
