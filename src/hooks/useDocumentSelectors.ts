import { useDocumentStore } from '@/stores/documentStore';
import {
  getHydratedLayers,
  getNodesInRenderOrder,
} from '@/stores/selectors/documentSelectors';

export const useHydratedLayers = () =>
  useDocumentStore((state) => getHydratedLayers(state.doc));

export const useRenderNodes = () =>
  useDocumentStore((state) => getNodesInRenderOrder(state.doc));

export const useActiveLayerId = () =>
  useDocumentStore((state) => state.doc.activeLayerId);
