import { useDocumentStore } from '@/stores/documentStore';
import { useLayerStore } from '@/stores/layerStore';
import { useSelectionStore } from '@/stores/selectionStore';
import type { Point, RoadNode } from '@/types/node';
import { useMemo } from 'react';
import { useRoadToolStore } from '../stores/roadToolStore';
import { flattenPoints, getRoadEdges } from '../utils/roadUtils';

export interface RoadViewModel extends RoadNode {
  isSelected: boolean;
  isEditing: boolean;
  flattenedPoints: number[];
  edges?: Array<{
    start: Point;
    end: Point;
    edgeIndex: number;
    insertIndex: number;
  }>;
}

export interface DraftViewModel {
  points: Point[];
  flattenedPoints: number[];
  isDrawing: boolean;
  canFinish: boolean;
}

export function useRoadAdapter() {
  const layerDoc = useLayerStore((s) => s.doc);
  const documentNodes = useDocumentStore((s) => s.doc.nodes);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const { draft, mode, activeTool } = useRoadToolStore();

  // 완성된 Road 노드 → ViewModel 변환
  const roads = useMemo((): RoadViewModel[] => {
    const allIds = layerDoc.layers.flatMap(
      (layer) => layerDoc.layerMapper[layer.id] ?? [],
    );

    return allIds
      .map((id) => documentNodes[id])
      .filter((node): node is RoadNode => node?.type === 'road')
      .map((node): RoadViewModel => {
        const isEditing =
          mode.type === 'editing-road' && mode.nodeId === node.id;
        return {
          ...node,
          isSelected: selectedIds.includes(node.id),
          isEditing,
          flattenedPoints: flattenPoints(node.points),
          edges: isEditing ? getRoadEdges(node.points, node.closed) : undefined,
        };
      });
  }, [layerDoc.layerMapper, documentNodes, selectedIds, mode]);

  // 그리기 중 드래프트 → ViewModel 변환
  const draftViewModel = useMemo((): DraftViewModel | null => {
    if (draft.points.length === 0 && !draft.previewPoint) {
      return null;
    }
    const points = draft.previewPoint
      ? [...draft.points, draft.previewPoint]
      : draft.points;

    return {
      points,
      flattenedPoints: flattenPoints(points),
      isDrawing: draft.isDrawing,
      canFinish: draft.points.length >= 2,
    };
  }, [draft]);

  return { roads, draft: draftViewModel, mode, activeTool };
}
