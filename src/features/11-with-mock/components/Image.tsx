import { useImage } from '@/hooks/useImage';
import type { ImageNode } from '@/types/node';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Image as KonvaImage } from 'react-konva';
import type { DraggableNode, SelectableNode } from '../type';

type ImageProps = Omit<ImageNode, 'type'> & SelectableNode & DraggableNode;

function Img({ url, id, x, y, onClick, ...props }: ImageProps) {
  const [image] = useImage(url);
  if (!image) {
    return null;
  }

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onClick();
  };

  return (
    <KonvaImage
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

export default Img;
