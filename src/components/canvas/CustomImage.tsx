import { useSvgImage } from '@/hooks/useSvgImage';
import type { ImageNode } from '@/types/node';
import type Konva from 'konva';
import { Image } from 'react-konva';

interface CustomImageProps extends Omit<ImageNode, 'type'> {
  isSelected?: boolean;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragStart?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  draggable?: boolean;
}

export default function CustomImage({
  url,
  id,
  x = 0,
  y = 0,
  fill,
  stroke,
  isSelected,
  onClick,
  onDragStart,
  onDragEnd,
  draggable,
  ...props
}: CustomImageProps) {
  const [image] = useSvgImage(url, { fill, stroke });

  if (!image) {
    return null;
  }

  const selectedStyle = isSelected
    ? {
        stroke: '#111827',
        strokeWidth: 3,
        shadowBlur: 5,
        shadowColor: 'rgba(0,0,0,0.3)',
      }
    : {};

  return (
    <Image
      id={id}
      image={image}
      x={x}
      y={y}
      draggable={draggable}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      {...selectedStyle}
      {...props}
    />
  );
}
