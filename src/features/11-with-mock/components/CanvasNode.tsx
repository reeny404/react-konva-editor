import { documentCommands } from '@/commands/documentCommands';
import type { CanvasNode } from '@/types/node';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Circle, Group, Rect } from 'react-konva';
import { useSelection } from '../hooks/useSelection';
import Img from './Image';
import Svg from './Svg';

export function CanvasNodeRenderer({
  node,
  readonly,
}: {
  node: CanvasNode;
  readonly: boolean;
}) {
  const { selectOnly, isSelected } = useSelection();

  const locked = readonly || Boolean(node.locked);
  const selectNode = () => selectOnly(node.id);
  const moveNode = (e: KonvaEventObject<DragEvent>) =>
    documentCommands.patchNode(node.id, {
      x: e.target.x(),
      y: e.target.y(),
    });

  switch (node.type) {
    case 'rect':
      return (
        <Rect
          key={node.id}
          onClick={selectNode}
          onDragEnd={moveNode}
          draggable={!locked}
          {...node}
        />
      );
    case 'circle':
      return (
        <Circle
          key={node.id}
          onClick={selectNode}
          onDragEnd={moveNode}
          draggable={!locked}
          {...node}
        />
      );
    case 'svg':
      return (
        <Svg
          key={node.id}
          isSelected={isSelected}
          selectOne={selectOnly}
          onDragEnd={moveNode}
          draggable={!locked}
          {...node}
        />
      );
    case 'image': {
      return (
        <Img
          key={node.id}
          isSelected={isSelected}
          selectOne={selectOnly}
          onDragEnd={moveNode}
          draggable={!locked}
          {...node}
        />
      );
    }
    case 'group':
      return (
        <Group key={node.id} listening={!locked}>
          {node.children.map((child) => (
            <CanvasNodeRenderer
              key={child.id}
              node={child}
              readonly={readonly}
            />
          ))}
        </Group>
      );
    default:
      return null;
  }
}
