import { useSvgImage } from '@/hooks/useSvgImage';
import type { ImageNode } from '@/types/node';
import type { DraggableNode, SelectableNode } from '@/types/type';
import { Image } from 'react-konva';

type SvgImageProps = Omit<ImageNode, 'type'> & SelectableNode & DraggableNode;

export default function CustomImage({
  url,
  id,
  x = 0,
  y = 0,
  fill,
  stroke,
  isSelected,
  selectOne,
  ...props
}: SvgImageProps) {
  const [image] = useSvgImage(url, { fill, stroke });

  if (!image) {
    return null;
  }

  const selectedStyle = isSelected?.(id)
    ? { stroke: '#111827', strokeWidth: 3 }
    : {};

  return (
    <Image
      id={id}
      image={image}
      x={x}
      y={y}
      onClick={(e) => {
        e.cancelBubble = true;
        selectOne(id);
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
        selectOne(id);
      }}
      {...selectedStyle}
      {...props}
    />
  );
}
