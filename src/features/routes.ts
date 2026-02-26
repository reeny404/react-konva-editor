/// <reference types="vite/client" />

import type { ComponentType } from 'react';

/**
 * src/features 하위 폴더를 glob으로 인식해 폴더명, path, Canvas 컴포넌트 목록 생성.
 * 폴더명이 "NN-name" 형식이면 path는 "/name".
 * 사이드바 NavLink와 App.tsx의 Route가 동일한 목록을 사용해 자동 등록됩니다.
 */
function getFeatureRoutes() {
  return Object.entries(
    import.meta.glob<{ default: ComponentType }>('@/features/*/Canvas.tsx', {
      eager: true,
      import: 'default',
    }),
  )
    .map(([key, moduleDefault]) => {
      const match = key.match(/features\/([^/]+)\//);
      if (!match || typeof moduleDefault !== 'function') {
        return null;
      }
      const folder = match[1];
      const pathName = folder.replace(/^\d+-/, ''); // "01-rect" -> "rect", "02-maintainer" -> "maintainer"
      return {
        folder,
        path: `/${pathName}`,
        Component: moduleDefault as ComponentType,
      };
    })
    .filter((item) => !!item)
    .sort((a, b) => a.folder.localeCompare(b.folder));
}

export const routes = getFeatureRoutes();
