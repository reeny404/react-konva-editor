/// <reference types="vite/client" />
/**
 * src/features 하위 폴더를 glob으로 인식해 폴더명과 path 목록 생성
 * 폴더명이 "NN-name" 형식이면 path는 "/name"
 */
const featureGlob = import.meta.glob('@/features/*/Canvas.tsx');

const FEATURE_FOLDER_REGEX = /features\/([^/]+)\//;

function getFeatureRoutes(): { folder: string; path: string }[] {
  return Object.keys(featureGlob)
    .map((key) => {
      const match = key.match(FEATURE_FOLDER_REGEX);
      if (!match) {
        return null;
      }
      const folder = match[1];
      const pathName = folder.replace(/^\d+-/, ''); // "01-rect" -> "rect", "02-maintainer" -> "maintainer"
      return { folder, path: `/${pathName}` };
    })
    .filter((item): item is { folder: string; path: string } => item !== null)
    .sort((a, b) => a.folder.localeCompare(b.folder));
}

export const featureRoutes = getFeatureRoutes();
