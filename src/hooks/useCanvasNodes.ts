import { useDocumentStore } from '@/stores/documentStore';
import { useMemo } from 'react';

export function useCanvasNodes() {
  const nodes = useDocumentStore((state) => state.doc.nodes);

  return useMemo(() => Object.values(nodes), [nodes]);
}
