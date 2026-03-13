import { useImage } from '@/hooks/useImage';
import type { ImageNode } from '@/types/node';
import { Image as KonvaImage } from 'react-konva';
import type { DraggableNode, SelectableNode } from '../type';

type ImageProps = Omit<ImageNode, 'type'> & SelectableNode & DraggableNode;

function Img({ url, id, x, y, selectOne, ...props }: ImageProps) {
  const [image] = useImage(url);
  if (!image) {
    return null;
  }

  return (
    <KonvaImage
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
      {...props}
    />
  );
}

export default Img;
