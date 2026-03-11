import type { Commander } from '@/commands/documentCommands';
import { documentCommands } from '@/commands/documentCommands';
import { useSelectedNode } from '@/selectors/documentSelectors';
import type Konva from 'konva';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';

export function SelectionTransformer({
  applyPatch = documentCommands.patchNode,
}: {
  applyPatch?: Commander['patchNode']; // commander 인터페이스를 따로 구현했을 경우 인자로 받도록
}) {
  const trRef = useRef<Konva.Transformer>(null);
  const selection = useSelectedNode();

  useEffect(() => {
    if (!trRef.current) {
      return;
    }

    const stage = trRef.current.getStage();
    if (!stage || !selection) {
      trRef.current.nodes([]);
      return;
    }

    // Canvas.tsx의 Rect에 넣은 id를 기반으로 노드 탐색
    const targetNode = stage.findOne('#' + selection.id);
    if (targetNode) {
      trRef.current.nodes([targetNode]);
    }
  }, [selection]);

  const handleTransformEnd = (e: KonvaPointerEvent) => {
    if (!selection) {
      return;
    }
    const node = e.target;

    applyPatch(selection.id, {
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      rotation: node.rotation(),
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  if (!selection) {
    return null;
  }

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
