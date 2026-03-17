import type { CanvasNode } from '@/types/node';
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
      if (!isNaN(num)) {
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

        {disabled ? (
          <div className='flex h-7 items-center rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-400'>
            -
          </div>
        ) : (
          <input
            type={type}
            className='h-7 w-full rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
            value={value}
            onChange={handleChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

export default function CanvasNodeProperties({
  selectedNode,
  updateSelectedNode,
}: {
  selectedNode: CanvasNode | null;
  updateSelectedNode: (patch: Partial<CanvasNode>) => void;
}) {
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
    </div>
  );
}
