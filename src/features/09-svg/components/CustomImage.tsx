import { Image } from 'react-konva';
import useImage from 'use-image';

type SvgImageProps = {
  url: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  draggable?: boolean;
};

export default function CustomImage({
  url,
  x = 0,
  y = 0,
  width,
  height,
  draggable = true,
}: SvgImageProps) {
  const [image] = useImage(url);

  if (!image) {
    return null;
  }

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      draggable={draggable}
    />
  );
}
