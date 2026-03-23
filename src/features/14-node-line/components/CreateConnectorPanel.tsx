import { type CanvasNode, type ConnectorLineStyle } from '@/types/node';
import { useState } from 'react';
import { nodeLineCommands } from '../commands/nodeLineCommands';

function parseDash(value: string): number[] {
  return value
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v) && v >= 0);
}

export default function CreateConnectorPanel({
  rectNodes,
}: {
  rectNodes: CanvasNode[];
}) {
  const [name, setName] = useState('New Connector');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [lineStyle, setLineStyle] = useState<ConnectorLineStyle>('straight');
  const [stroke, setStroke] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [tension, setTension] = useState(0);
  const [dashInput, setDashInput] = useState('');
  const [tooltip, setTooltip] = useState('');

  const canCreate = selectedNodeIds.length >= 2;

  const toggleNode = (nodeId: string) => {
    setSelectedNodeIds((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId],
    );
  };

  return (
    <div className='space-y-5 rounded-xl border border-slate-200 bg-white p-4'>
      <div className='space-y-2'>
        <h3 className='text-sm font-semibold text-slate-800'>
          Create Connector
        </h3>
        <p className='mt-1 text-xs text-slate-500'>
          연결할 노드를 선택하고 선 스타일을 정한 뒤 노드들을 연결하는 선을
          생성할 수 있습니다.
        </p>
      </div>

      <div className='space-y-5'>
        <label className='flex flex-col gap-1 text-xs'>
          <span className='text-slate-500'>Name</span>
          <input
            className='rounded border border-slate-300 px-2 py-1'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className='space-y-2'>
          <div className='text-xs text-slate-500'>Connect Nodes</div>
          <div className='flex flex-wrap gap-2'>
            {rectNodes.map((node) => {
              const checked = selectedNodeIds.includes(node.id);
              return (
                <button
                  key={node.id}
                  type='button'
                  onClick={() => toggleNode(node.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    checked
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {node.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <label className='flex flex-col gap-1 text-xs'>
            <span className='text-slate-500'>Line Style</span>
            <select
              className='rounded border border-slate-300 px-2 py-1'
              value={lineStyle}
              onChange={(e) =>
                setLineStyle(e.target.value as ConnectorLineStyle)
              }
            >
              <option value='straight'>straight</option>
              <option value='orthogonal'>orthogonal</option>
              <option value='curved'>curved</option>
            </select>
          </label>

          <label className='flex flex-col gap-1 text-xs'>
            <span className='text-slate-500'>Stroke Width</span>
            <input
              type='number'
              className='rounded border border-slate-300 px-2 py-1'
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            />
          </label>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <label className='flex flex-col gap-1 text-xs'>
            <span className='text-slate-500'>Stroke</span>
            <input
              type='color'
              className='h-8 rounded border border-slate-300 px-1 py-1'
              value={stroke}
              onChange={(e) => setStroke(e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-xs'>
            <span className='text-slate-500'>Dash</span>
            <input
              className='rounded border border-slate-300 px-2 py-1'
              value={dashInput}
              onChange={(e) => setDashInput(e.target.value)}
              placeholder='ex) 12, 8'
            />
          </label>
        </div>

        <label className='flex flex-col gap-1 text-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-slate-500'>Tension</span>
            <span className='text-slate-400'>{tension.toFixed(2)}</span>
          </div>
          <input
            type='range'
            min={0}
            max={1}
            step={0.05}
            value={tension}
            onChange={(e) => setTension(Number(e.target.value))}
          />
        </label>

        <label className='flex flex-col gap-1 text-xs'>
          <span className='text-slate-500'>Tooltip</span>
          <input
            className='rounded border border-slate-300 px-2 py-1'
            value={tooltip}
            onChange={(e) => setTooltip(e.target.value)}
          />
        </label>
      </div>

      <button
        type='button'
        disabled={!canCreate}
        onClick={() =>
          nodeLineCommands.createConnector({
            name,
            nodeIds: selectedNodeIds,
            lineStyle,
            stroke,
            strokeWidth,
            tension,

            dash: parseDash(dashInput),
            tooltip,
          })
        }
        className='w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40'
      >
        Add Connector
      </button>
    </div>
  );
}
