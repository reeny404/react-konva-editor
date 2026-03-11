import RECT from '@/icons/box.svg';
import CIRCLE from '@/icons/circle.svg';
import type { Color } from '@/types/style';
import { replaceSvgFillStroke } from './replaceSvgFillStroke';

type Type = 'box' | 'circle';

const MAPPER: Record<Type, string> = {
  box: RECT,
  circle: CIRCLE,
};

export function getCustomImageSvg(type: keyof typeof MAPPER, color: Color) {
  return replaceSvgFillStroke(MAPPER[type], {
    fill: color.fill,
    stroke: color.stroke,
  });
}
