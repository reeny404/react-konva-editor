import ToggleButton from '@/components/ToggleButton';
import { NodeType } from '@/types/node';
import { useEffect, useMemo, useState } from 'react';
import Canvas from './Canvas';
import { nodeLineCommands } from './commands/nodeLineCommands';
import CreateConnectorPanel from './components/CreateConnectorPanel';
import { useNodeLineAdapter } from './hooks/useNodeLineAdapter';

export default function NodeLineFeature() {
  const { boxNodes, connectors, selection, documentNodes } =
    useNodeLineAdapter();
  const [hoveredConnectorId, setHoveredConnectorId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    nodeLineCommands.loadDemo();
  }, []);

  const selectedNode = selection.type !== 'none' ? selection.node : null;
  const selectedConnector =
    selection.type === 'connector' ? selection.node : null;

  const rectNodes = useMemo(
    () =>
      Object.values(documentNodes).filter(
        (node) => node.type === NodeType.Rect,
      ),
    [documentNodes],
  );

  const areAllConnectorsLocked = useMemo(
    () =>
      connectors.length > 0 &&
      connectors.every((connector) => connector.readonly),
    [connectors],
  );

  const areAllConnectorsSelectable = useMemo(
    () =>
      connectors.length > 0 &&
      connectors.every((connector) => connector.selectable),
    [connectors],
  );

  const areAllConnectorsVisible = useMemo(
    () =>
      connectors.length > 0 &&
      connectors.every((connector) => connector.visible),
    [connectors],
  );

  return (
    <div className='flex h-full min-h-0'>
      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex flex-none items-center justify-between border-b border-slate-200 bg-white px-4 py-3'>
          <div className='flex items-center gap-2'>
            <button
              className='rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800'
              onClick={() => nodeLineCommands.loadDemo()}
            >
              Reset
            </button>

            <div className='flex items-center gap-3'>
              {connectors.length > 0 && (
                <>
                  <ToggleButton
                    label='Locked'
                    value={areAllConnectorsLocked}
                    onChange={(checked) =>
                      nodeLineCommands.patchAllConnectors({
                        locked: checked,
                      })
                    }
                  />

                  <ToggleButton
                    label='Selectable'
                    value={areAllConnectorsSelectable}
                    onChange={(checked) =>
                      nodeLineCommands.patchAllConnectors({
                        selectable: checked,
                      })
                    }
                  />
                  <ToggleButton
                    label='Visible'
                    value={areAllConnectorsVisible}
                    onChange={(checked) =>
                      nodeLineCommands.patchAllConnectors({
                        visible: checked,
                      })
                    }
                  />
                </>
              )}

              {!selectedNode && (
                <div className='text-[10px] font-bold text-slate-400 italic'>
                  Select any node to edit properties
                </div>
              )}
            </div>
          </div>

          <div className='rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400'>
            {selectedConnector?.name ?? selectedNode?.name ?? 'NODE LINE POC'}
          </div>
        </header>

        <main className='relative min-h-0 min-w-0 flex-1 bg-slate-50'>
          <Canvas
            boxNodes={boxNodes}
            connectors={connectors}
            hoveredConnectorId={hoveredConnectorId}
            onStageClick={() => {
              setHoveredConnectorId(null);
              nodeLineCommands.resetSelection();
            }}
            onSelectNode={nodeLineCommands.selectNode}
            onHoverConnector={setHoveredConnectorId}
            onMoveBoxNode={nodeLineCommands.moveBoxNode}
          />
        </main>
      </div>

      <aside className='w-80 flex-none border-l border-slate-200 bg-white p-4'>
        <CreateConnectorPanel rectNodes={rectNodes} />
      </aside>
    </div>
  );
}
