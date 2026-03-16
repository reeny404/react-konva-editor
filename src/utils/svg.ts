import RECT from '@/icons/box.svg';
import CIRCLE from '@/icons/circle.svg';
import type { Color } from '@/types/style';

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

/**
 * <svg>의 fill, stroke만 변경
 */
export function replaceSvgFillStroke(
  svgText: string,
  color: Partial<Color>,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  const root = doc.querySelector('svg');
  if (!root) {
    return svgText;
  }

  if (color.fill !== undefined && color.fill !== '') {
    root.setAttribute('fill', color.fill);
  }
  if (color.stroke !== undefined && color.stroke !== '') {
    root.setAttribute('stroke', color.stroke);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}
