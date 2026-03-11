import { useEffect, useState } from 'react';

type ImageLoadStatus = 'loaded' | 'loading' | 'failed';

/**
 *
 * @param url
 * @returns HTMLImageElement
 */
export function useImage(
  url: string,
): [HTMLImageElement | undefined, ImageLoadStatus] {
  const [state, setState] = useState<{
    image: HTMLImageElement | undefined;
    status: ImageLoadStatus;
  }>({ image: undefined, status: 'loading' });

  useEffect(() => {
    if (!url) {
      setState({ image: undefined, status: 'failed' });
      return;
    }

    const img = new window.Image();
    let cancelled = false;

    img.onload = () => {
      if (!cancelled) {
        setState({ image: img, status: 'loaded' });
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setState({ image: undefined, status: 'failed' });
      }
    };
    img.src = url;

    return () => {
      cancelled = true;
      img.src = '';
    };
  }, [url]);

  return [state.image, state.status];
}
