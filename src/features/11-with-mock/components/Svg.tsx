import { useSvgImage } from '@/hooks/useSvgImage';
import type { SvgNode } from '@/types/node';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Image } from 'react-konva';
import type { DraggableNode, SelectableNode } from '../type';

type SvgImageProps = Omit<SvgNode, 'type' | 'selectOne'> &
  SelectableNode &
  DraggableNode;

export default function Svg({
  url,
  id,
  x = 0,
  y = 0,
  fill,
  stroke,
  onClick,
  ...props
}: SvgImageProps) {
  const [image] = useSvgImage(url, { fill, stroke });

  if (!image) {
    return null;
  }

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onClick();
  };

  return (
    <Image
      id={id}
      image={image}
      x={x}
      y={y}
      onClick={handleClick}
      onDragStart={handleClick}
      {...props}
    />
  );
}
