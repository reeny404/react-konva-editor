import {
  NodeType,
  type CanvasNode,
  type ConnectorLineNode,
} from '@/types/node';
import React from 'react';

type PropertyInputProps = {
  value: string | number;
  label: string;
  type?: 'text' | 'number' | 'color';
  onUpdate: (val: string | number) => void;
  disabled?: boolean;
};

function PropertyInput({
  value,
  label,
  type = 'text',
  onUpdate,
  disabled = false,
}: PropertyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const val = e.target.value;

    if (type === 'number') {
      const num = Number(val);
      if (!Number.isNaN(num)) {
        onUpdate(num);
      }
      return;
    }

    onUpdate(val);
  };

  return (
    <div className='rounded-lg bg-slate-100 px-3 py-2'>
      <div className='flex flex-col'>
        <label className='mb-1 text-xs text-slate-500'>{label}</label>
        <input
          type={type}
          className='h-7 w-full rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className='flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700'>
      <span>{label}</span>
      <input
        type='checkbox'
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  disabled = false,
  options,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className='rounded-lg bg-slate-100 px-3 py-2'>
      <div className='flex flex-col'>
        <label className='mb-1 text-xs text-slate-500'>{label}</label>
        <select
          className='h-7 w-full rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className='rounded-lg bg-slate-100 px-3 py-2'>
      <div className='mb-1 flex items-center justify-between'>
        <label className='text-xs text-slate-500'>{label}</label>
        <span className='text-xs text-slate-400'>{value.toFixed(2)}</span>
      </div>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className='w-full'
      />
    </div>
  );
}

function parseNodeIds(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseDash(value: string): number[] {
  return value
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v) && v >= 0);
}

function isConnectorLineNode(
  node: CanvasNode | null,
): node is ConnectorLineNode {
  return node?.type === NodeType.ConnectorLine;
}

export default function CanvasNodeProperties({
  selectedNode,
  updateSelectedNode,
}: {
  selectedNode: CanvasNode | null;
  updateSelectedNode: (patch: Partial<CanvasNode>) => void;
}) {
  const isConnector = isConnectorLineNode(selectedNode);
  const isReadonlyConnector =
    selectedNode?.type === NodeType.ConnectorLine &&
    Boolean(selectedNode.locked);

  if (isConnector) {
    return (
      <div className='space-y-3 text-sm'>
        <div className='space-y-2'>
          <p className='text-xs font-medium text-slate-500'>
            선택한 커넥터 편집
          </p>
          <p className='font-medium text-slate-800'>{selectedNode.name}</p>
        </div>

        <PropertyInput
          label='Name'
          type='text'
          value={selectedNode.name}
          disabled={!selectedNode || isReadonlyConnector}
          onUpdate={(val) => updateSelectedNode({ name: String(val) })}
        />

        <PropertyInput
          label='Node IDs'
          type='text'
          value={selectedNode.nodeIds.join(', ')}
          disabled={!selectedNode || isReadonlyConnector}
          onUpdate={(val) =>
            updateSelectedNode({
              nodeIds: parseNodeIds(String(val)),
            } as Partial<CanvasNode>)
          }
        />

        <div className='grid grid-cols-2 gap-2 text-xs'>
          <SelectField
            label='Line Style'
            value={selectedNode.lineStyle}
            disabled={!selectedNode || isReadonlyConnector}
            options={[
              { label: 'Straight', value: 'straight' },
              { label: 'Orthogonal', value: 'orthogonal' },
              { label: 'Curved', value: 'curved' },
            ]}
            onChange={(value) =>
              updateSelectedNode({
                lineStyle: value as ConnectorLineNode['lineStyle'],
              } as Partial<CanvasNode>)
            }
          />

          <PropertyInput
            label='Stroke Width'
            type='number'
            value={selectedNode.strokeWidth}
            disabled={!selectedNode || isReadonlyConnector}
            onUpdate={(val) =>
              updateSelectedNode({
                strokeWidth: Number(val),
              } as Partial<CanvasNode>)
            }
          />
        </div>

        <div className='grid grid-cols-2 gap-2 text-xs'>
          <PropertyInput
            label='Stroke'
            type='color'
            value={selectedNode.stroke}
            disabled={!selectedNode || isReadonlyConnector}
            onUpdate={(val) =>
              updateSelectedNode({
                stroke: String(val),
              } as Partial<CanvasNode>)
            }
          />

          <PropertyInput
            label='Dash'
            type='text'
            value={(selectedNode.dash ?? []).join(', ')}
            disabled={!selectedNode || isReadonlyConnector}
            onUpdate={(val) =>
              updateSelectedNode({
                dash: parseDash(String(val)),
              } as Partial<CanvasNode>)
            }
          />
        </div>

        <RangeField
          label='Tension'
          value={selectedNode.tension ?? 0}
          min={0}
          max={1}
          step={0.05}
          disabled={!selectedNode || isReadonlyConnector}
          onChange={(value) =>
            updateSelectedNode({
              tension: value,
            } as Partial<CanvasNode>)
          }
        />

        <PropertyInput
          label='Tooltip'
          type='text'
          value={selectedNode.tooltip ?? ''}
          disabled={!selectedNode || isReadonlyConnector}
          onUpdate={(val) =>
            updateSelectedNode({
              tooltip: String(val),
            } as Partial<CanvasNode>)
          }
        />

        <div className='rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500'>
          <p>nodeIds는 쉼표로 구분해서 입력</p>
          <p>dash는 예: 12, 8</p>
          <p>orthogonal + tension은 rounded elbow처럼 보일 수 있음</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3 text-sm'>
      <div>
        <p className='text-xs text-slate-500'>선택 객체</p>
        <p className='font-medium text-slate-800'>
          {selectedNode ? selectedNode.name : '-'}
        </p>
      </div>

      <div className='grid grid-cols-2 gap-2 text-xs'>
        <PropertyInput
          label='X'
          type='number'
          value={selectedNode ? Math.round(selectedNode.x) : ''}
          disabled={!selectedNode}
          onUpdate={(val) => updateSelectedNode({ x: Number(val) })}
        />
        <PropertyInput
          label='Y'
          type='number'
          value={selectedNode ? Math.round(selectedNode.y) : ''}
          disabled={!selectedNode}
          onUpdate={(val) => updateSelectedNode({ y: Number(val) })}
        />
      </div>

      <div className='grid grid-cols-2 gap-2 text-xs'>
        <PropertyInput
          label='Width'
          type='number'
          value={selectedNode ? Math.round(selectedNode.width) : ''}
          disabled={!selectedNode}
          onUpdate={(val) => updateSelectedNode({ width: Number(val) })}
        />
        <PropertyInput
          label='Height'
          type='number'
          value={selectedNode ? Math.round(selectedNode.height) : ''}
          disabled={!selectedNode}
          onUpdate={(val) => updateSelectedNode({ height: Number(val) })}
        />
      </div>

      <div className='grid grid-cols-2 gap-2 text-xs'>
        <PropertyInput
          label='Opacity'
          type='number'
          value={selectedNode?.opacity ?? 100}
          disabled={!selectedNode}
          onUpdate={(val) => updateSelectedNode({ opacity: Number(val) })}
        />
        <PropertyInput
          label='Rotation'
          type='number'
          value={selectedNode?.rotation ?? 0}
          disabled={!selectedNode}
          onUpdate={(val) => updateSelectedNode({ rotation: Number(val) })}
        />
      </div>

      <div className='grid grid-cols-2 gap-2 text-xs'>
        {selectedNode && 'fill' in selectedNode && (
          <>
            <PropertyInput
              label='Fill'
              type='color'
              value={selectedNode.fill ?? '#000000'}
              disabled={!selectedNode}
              onUpdate={(val) => updateSelectedNode({ fill: String(val) })}
            />
            <PropertyInput
              label='Stroke'
              type='color'
              value={selectedNode.stroke ?? '#000000'}
              disabled={!selectedNode}
              onUpdate={(val) => updateSelectedNode({ stroke: String(val) })}
            />
          </>
        )}
      </div>

      {selectedNode &&
        (selectedNode.type === NodeType.Road ||
          selectedNode.type === NodeType.Polygon) && (
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <PropertyInput
              label='Stroke Width'
              type='number'
              value={selectedNode.strokeWidth}
              disabled={!selectedNode}
              onUpdate={(val) =>
                updateSelectedNode({ strokeWidth: Number(val) })
              }
            />
          </div>
        )}
    </div>
  );
}
