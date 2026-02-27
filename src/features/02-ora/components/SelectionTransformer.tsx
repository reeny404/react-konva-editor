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

  if (!selectedNodeData) {
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
