import type { DocumentCommands } from '@/commands/documentCommands';
import { documentCommands } from '@/commands/documentCommands';
import { useSelectedNode } from '@/hooks/useSelectedNode';
import { useDocumentStore } from '@/stores/documentStore';
import { isNodeLockedInLayers } from '@/utils/nodeUtils';
import type Konva from 'konva';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';

export function SelectionTransformer({
  applyPatch = documentCommands.patchNode,
}: {
  applyPatch?: DocumentCommands['patchNode'];
}) {
  const ref = useRef<Konva.Transformer>(null);
  const selection = useSelectedNode();

  // 유틸리티를 사용하여 잠금 상태 확인
  const isLocked = useDocumentStore((state) =>
    selection ? isNodeLockedInLayers(state.doc.layers, selection.id) : false,
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (!selection || isLocked) {
      ref.current.nodes([]);
      return;
    }

    const stage = ref.current.getStage();
    if (!stage) {
      return;
    }

    const targetNode = stage.findOne('#' + selection.id);
    if (targetNode) {
      ref.current.nodes([targetNode]);
    } else {
      ref.current.nodes([]);
    }
  }, [selection, isLocked]);

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
      ref={ref}
      onTransformEnd={handleTransformEnd}
      anchorFill='#ffffff'
      anchorStroke='#2563eb'
      anchorCornerRadius={2}
      borderStroke='#2563eb'
    />
  );
}
