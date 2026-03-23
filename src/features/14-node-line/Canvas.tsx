import type { NodeLineBoxNode } from '@/features/14-node-line/types/nodeLine';
import useCanvasStage from '@/hooks/useCanvasStage';
import { CanvasStage } from '@/ui/CanvasStage';
import { Arrow, Label, Layer, Rect, Tag, Text } from 'react-konva';
import { Fragment } from 'react/jsx-runtime';
import type { ConnectorViewModel } from './types/nodeLine';

type Props = {
  boxNodes: NodeLineBoxNode[];
  connectors: ConnectorViewModel[];
  hoveredConnectorId: string | null;
  onStageClick: () => void;
  onSelectNode: (id: string) => void;
  onHoverConnector: (id: string | null) => void;
  onMoveBoxNode: (id: string, position: { x: number; y: number }) => void;
};

export default function Canvas({
  boxNodes,
  connectors,
  hoveredConnectorId,
  onStageClick,
  onSelectNode,
  onHoverConnector,
  onMoveBoxNode,
}: Props) {
  const { containerRef, stageSize } = useCanvasStage();

  return (
    <CanvasStage
      containerRef={containerRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) {
          onStageClick();
        }
      }}
    >
      <Layer>
        <Text
          x={20}
          y={20}
          text='Node Line Test'
          fontSize={14}
          fill='#475569'
        />

        {connectors.map((connector) => {
          if (!connector.visible) {
            return null;
          }

          const isHovered = hoveredConnectorId === connector.id;
          const displayStroke = connector.isSelected
            ? '#0f172a'
            : connector.stroke;
          const displayWidth = connector.isSelected
            ? connector.strokeWidth + 2
            : connector.strokeWidth;

          return (
            <Fragment key={connector.id}>
              <Arrow
                id={connector.id}
                points={connector.points}
                stroke={displayStroke}
                fill={displayStroke}
                strokeWidth={displayWidth}
                pointerLength={14}
                pointerWidth={14}
                tension={connector.tension}
                dash={connector.dash}
                lineCap='round'
                lineJoin='round'
                hitStrokeWidth={Math.max(connector.strokeWidth + 12, 18)}
                opacity={connector.readonly ? 0.9 : 1}
                onClick={(e) => {
                  e.cancelBubble = true;
                  if (connector.selectable) {
                    onSelectNode(connector.id);
                  }
                }}
                onMouseEnter={() => onHoverConnector(connector.id)}
                onMouseLeave={() => onHoverConnector(null)}
              />

              {isHovered && connector.tooltip && connector.tooltipPosition && (
                <Label
                  x={connector.tooltipPosition.x + 12}
                  y={connector.tooltipPosition.y - 24}
                  listening={false}
                >
                  <Tag
                    fill='#0f172a'
                    cornerRadius={6}
                    pointerDirection='down'
                  />
                  <Text
                    text={connector.tooltip}
                    fontSize={12}
                    fill='#f8fafc'
                    padding={8}
                  />
                </Label>
              )}
            </Fragment>
          );
        })}

        {boxNodes.map((node) => (
          <Fragment key={node.id}>
            <Rect
              id={node.id}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={node.fill}
              stroke={node.stroke}
              strokeWidth={2}
              cornerRadius={12}
              draggable
              onClick={(e) => {
                e.cancelBubble = true;
                onSelectNode(node.id);
              }}
              onDragEnd={(e) => {
                onMoveBoxNode(node.id, { x: e.target.x(), y: e.target.y() });
              }}
            />
            <Text
              x={node.x}
              y={node.y + node.height / 2 - 8}
              width={node.width}
              align='center'
              text={node.name}
              fontSize={14}
              fill='#0f172a'
              listening={false}
            />
          </Fragment>
        ))}
      </Layer>
    </CanvasStage>
  );
}
