import type { Size } from '@/types';
import { Text } from 'react-konva';
import type { useZoomPan } from '../hooks/useZoomPan';

type ZoomInformationProps = Pick<
  ReturnType<typeof useZoomPan>,
  'scale' | 'pan' | 'viewportLeftBottom'
> & {
  size: Size;
};

function ZoomInformation({
  size,
  scale,
  pan,
  viewportLeftBottom,
}: ZoomInformationProps) {
  return (
    <>
      <Text
        x={20}
        y={20}
        text='09-preview | wheel: zoom | middle-drag: pan'
        fontSize={18}
        fill='#0f172a'
        listening={false}
      />

      <Text
        x={20}
        y={52}
        text={`scale: ${scale.toFixed(2)} / pan: (${Math.round(pan.x)}, ${Math.round(pan.y)})`}
        fontSize={14}
        fill='#334155'
        listening={false}
      />

      <Text
        x={20}
        y={74}
        text={`visible left-bottom (editor coords): (${Math.round(viewportLeftBottom.x)}, ${Math.round(viewportLeftBottom.y)})`}
        fontSize={14}
        fill='#334155'
        listening={false}
      />

      <Text
        x={12}
        y={size.height - 26}
        text='(0,0)'
        fontSize={14}
        fill='#0f172a'
        listening={false}
      />
    </>
  );
}

export default ZoomInformation;
