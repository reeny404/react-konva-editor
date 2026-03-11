import type { Color } from '../types';

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
