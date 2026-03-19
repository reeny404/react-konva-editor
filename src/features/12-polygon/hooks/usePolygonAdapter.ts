import { useDocumentStore } from '@/stores/documentStore';
import { useLayerStore } from '@/stores/layerStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { NodeType, type PolygonNode, type PolygonPoint } from '@/types/node';
import { useMemo } from 'react';
import { usePolygonToolStore } from '../stores/polygonToolStore';
import { flattenPoints, getPolygonEdges } from '../utils/polygonUtils';

/**
 * DB 모델(Store)을 Canvas 전용 ViewModel로 변환하는 역할을 수행합니다.
 * Canvas는 이 훅에서 가공된 데이터를 받아 렌더링만 수행합니다.
 */

export interface PolygonViewModel extends PolygonNode {
  isSelected: boolean;
  isEditing: boolean;
  flattenedPoints: number[];
  edges?: Array<{
    start: PolygonPoint;
    end: PolygonPoint;
    edgeIndex: number;
    insertIndex: number;
  }>;
}

export function usePolygonAdapter() {
  // 1. 필요한 Store 상태들 가져오기
  const layerDoc = useLayerStore((state) => state.doc);
  const documentNodes = useDocumentStore((state) => state.doc.nodes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const { draft, mode, activeTool, rectDraft } = usePolygonToolStore();

  // 2. 완성된 폴리곤 노드들을 ViewModel로 변환
  const polygonViewModels = useMemo(() => {
    // 모든 node id 꺼냄, flat하게
    const allNodeIds = layerDoc.layers.flatMap(
      (layer) => layerDoc.layerMapper[layer.id] || [],
    );

    return allNodeIds
      .map((id) => documentNodes[id])
      .filter((node): node is PolygonNode => node?.type === NodeType.Polygon) //그 아이디로 실제 node 가져와 polygon만 꺼냄
      .map((node): PolygonViewModel => {
        const isEditing =
          mode.type === 'editing-polygon' && mode.nodeId === node.id;
        return {
          ...node,
          isSelected: selectedIds.includes(node.id),
          isEditing,
          flattenedPoints: flattenPoints(node.points),
          edges: isEditing ? getPolygonEdges(node.points) : undefined,
        };
      });
  }, [layerDoc.layerMapper, documentNodes, selectedIds, mode]);

  // 3. 그리기 중인 Draft 데이터 ViewModel 변환
  const draftViewModel = useMemo(() => {
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
      isHoveringStartPoint: draft.isHoveringStartPoint,
      canFinish: draft.points.length >= 3,
    };
  }, [draft]);

  // 4. 사각형 드래프트 ViewModel
  const rectDraftViewModel = useMemo(() => {
    if (!rectDraft || mode.type !== 'drawing-polygon-from-rect') {
      return null;
    }
    return {
      x: rectDraft.width < 0 ? rectDraft.x + rectDraft.width : rectDraft.x,
      y: rectDraft.height < 0 ? rectDraft.y + rectDraft.height : rectDraft.y,
      width: Math.abs(rectDraft.width),
      height: Math.abs(rectDraft.height),
    };
  }, [rectDraft, mode]);

  return {
    polygons: polygonViewModels,
    draft: draftViewModel,
    rectDraft: rectDraftViewModel,
    activeTool,
    mode,
  };
}
