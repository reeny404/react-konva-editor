import type { NodeId } from '@/common/types';
import { Image } from 'react-konva';
import useImage from 'use-image';
import type { SelectableNode } from '../type';

type SvgImageProps = {
  id: NodeId;
  url: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  draggable?: boolean;
} & SelectableNode;

export default function CustomImage({
  url,
  id,
  x = 0,
  y = 0,
  width,
  height,
  draggable = false,
  isSelected,
  selectOne: select,
}: SvgImageProps) {
  const [image] = useImage(url);

  if (!image) {
    return null;
  }

  const selected = isSelected?.(id) ?? false;

  return (
    <Image
      id={id}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      draggable={draggable}
      stroke={selected ? '#111827' : undefined}
      strokeWidth={selected ? 3 : undefined}
      onClick={(e) => {
        e.cancelBubble = true;
        select(id);
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
        select(id);
      }}
    />
  );
}
