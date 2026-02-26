import { useSelectedNode } from '@/common/selectors/documentSelectors';
import type Konva from 'konva';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { documentCommands } from '../commands/documentCommands';

export function SelectionTransformer() {
  const trRef = useRef<Konva.Transformer>(null);
  const selectedNodeData = useSelectedNode();

  useEffect(() => {
    if (!trRef.current) {
      return;
    }

    const stage = trRef.current.getStage();
    if (!stage || !selectedNodeData) {
      trRef.current.nodes([]);
      return;
    }

    // Canvas.tsx의 Rect에 넣은 id를 기반으로 노드 탐색
    const targetNode = stage.findOne('#' + selectedNodeData.id);
    if (targetNode) {
      trRef.current.nodes([targetNode]);
    }
  }, [selectedNodeData]);

  const handleTransformEnd = (e: KonvaPointerEvent) => {
    if (!selectedNodeData) {
      return;
    }
    const node = e.target;

    documentCommands.moveNode(selectedNodeData.id, {
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      rotation: node.rotation(),
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  // 선택된 노드가 없으면 아무것도 그리지 않음
  if (!selectedNodeData) {
    return null;
  }

  // 실제 UI(Transformer)를 여기서 반환
  return (
    <Transformer
      ref={trRef}
      onTransformEnd={handleTransformEnd}
      anchorFill='#ffffff'
      anchorStroke='#2563eb'
      anchorCornerRadius={2}
      borderStroke='#2563eb'
    />
  );
}
