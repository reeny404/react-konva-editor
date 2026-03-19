import { documentCommands } from '@/commands/documentCommands';
import { useSelectionStore } from '@/stores/selectionStore';
import type { CanvasNode as CanvasNodeType } from '@/types/node';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback } from 'react';
import { Circle, Group, Rect } from 'react-konva';
import Img from './Image';
import Svg from './Svg';

export function CanvasNode({
  node,
  readonly,
}: {
  node: CanvasNodeType;
  readonly: boolean;
}) {
  const selectOnly = useSelectionStore((state) => state.selectOnly);
  const selectNode = useCallback(() => selectOnly(node.id), [node.id]);
  const moveNode = (e: KonvaEventObject<DragEvent>) =>
    documentCommands.patchNode(node.id, {
      x: e.target.x(),
      y: e.target.y(),
    });

  const { type, locked, ...props } = node;
  const isLocked = readonly || Boolean(locked);

  switch (type) {
    case 'group': {
      return (
        <Group key={node.id}>
          {node.children.map((child) => (
            <CanvasNode key={child.id} node={child} readonly={readonly} />
          ))}
        </Group>
      );
    }

    case 'rect': {
      return (
        <Rect
          key={node.id}
          onClick={selectNode}
          onDragEnd={moveNode}
          draggable={!isLocked}
          {...props}
        />
      );
    }

    case 'circle': {
      return (
        <Circle
          key={node.id}
          onClick={selectNode}
          onDragEnd={moveNode}
          draggable={!isLocked}
          {...props}
        />
      );
    }

    case 'svg': {
      return (
        <Svg
          key={node.id}
          onClick={selectNode}
          onDragEnd={moveNode}
          draggable={!isLocked}
          {...node}
        />
      );
    }

    case 'image': {
      return (
        <Img
          key={node.id}
          onClick={selectNode}
          onDragEnd={moveNode}
          draggable={!isLocked}
          {...node}
        />
      );
    }

    default:
      return null;
  }
}
