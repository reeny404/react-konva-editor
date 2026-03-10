import type { ImageNode } from '@/common/types';
import { Image } from 'react-konva';
import useImage from 'use-image';
import type { DraggableNode, SelectableNode } from '../type';

type SvgImageProps = Pick<
  ImageNode,
  'id' | 'url' | 'x' | 'y' | 'width' | 'height' | 'url'
> &
  SelectableNode &
  DraggableNode;

export default function CustomImage({
  url,
  id,
  x = 0,
  y = 0,
  isSelected,
  selectOne,
  ...props
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
      stroke={selected ? '#111827' : undefined}
      strokeWidth={selected ? 3 : undefined}
      onClick={(e) => {
        e.cancelBubble = true;
        selectOne(id);
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
        selectOne(id);
      }}
      {...props}
    />
  );
}
