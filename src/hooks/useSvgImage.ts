import { useEffect, useRef, useState } from 'react';
import type { Color } from '../types';
import { replaceSvgFillStroke } from '../utils/replaceSvgFillStroke';
import { useImage } from './useImage';

/** 로딩 중 useImage에 넘길 1x1 투명 PNG (빈 SVG 사용하니 로딩 동안 깜빡여서..) */
const PLACEHOLDER_IMAGE_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * @param url
 * @param color
 * @returns HTMLImageElement
 */
export function useSvgImage(url: string, color: Partial<Color>) {
  const [modifiedUrl, setModifiedUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(url)
      .then((r) => r.text())
      .then((svgText) => {
        if (cancelled) {
          return;
        }

        const modified = replaceSvgFillStroke(svgText, color);
        const blob = new Blob([modified], { type: 'image/svg+xml' });
        const blobUrl = URL.createObjectURL(blob);

        const previousUrl = blobUrlRef.current;
        blobUrlRef.current = blobUrl;
        setModifiedUrl(blobUrl);
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModifiedUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, color.fill, color.stroke]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  return useImage(modifiedUrl ?? PLACEHOLDER_IMAGE_URL);
}
