import { documentCommands } from '@/commands/documentCommands';
import { redoCommand, undoCommand } from '@/commands/history';
import { selectionCommands } from '@/commands/selectionCommands';
import { PropertyInput } from '@/components/right-panel/PropertyInput';
import { layerCommands } from '@/features/10-layer/commands/layerCommands';
import { routes } from '@/features/routes';
import { useSelectedNode } from '@/hooks/useSelectedNode';
import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { getHydratedLayers } from '@/stores/selectors/documentSelectors';
import type { CanvasNode } from '@/types/node';
import { NavLink, Outlet } from 'react-router-dom';
import SectionCard from './SectionCard';

export default function AppLayout() {
  const doc = useDocumentStore((state) => state.doc);
  const layers = getHydratedLayers(doc);
  const orderedLayers = [...layers].reverse();
  const activeLayerId = doc.activeLayerId;
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedNode = useSelectedNode();

  const updateSelectedNode = (patch: Partial<CanvasNode>) => {
    if (!selectedNode) {
      return;
    }
    documentCommands.patchNode(selectedNode.id, patch);
  };

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-slate-100'>
      <aside
        role='LeftPanel'
        className='hidden w-72 shrink-0 space-y-4 border-r border-slate-200 bg-slate-50 p-4 lg:block'
      >
        <SectionCard title='Features'>
          <ul className='max-h-[300px] space-y-2 overflow-y-auto text-sm'>
            {routes.map(({ folder, path }) => (
              <li key={folder}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `block w-full rounded-lg border px-3 py-2 text-left transition ${
                      isActive
                        ? 'border-sky-200 bg-sky-50 font-medium text-sky-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {folder}
                </NavLink>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title='Layers & Nodes'>
          <ul className='max-h-[calc(100vh-400px)] space-y-4 overflow-y-auto text-sm'>
            {orderedLayers.map((layer) => {
              const isActive = activeLayerId === layer.id;

              return (
                <li key={layer.id} className='space-y-1'>
                  <button
                    type='button'
                    onClick={() => layerCommands.setActiveLayer(layer.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left font-medium transition ${
                      isActive
                        ? 'border-sky-400 bg-sky-50 text-sky-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className='flex items-center gap-2'>
                      {isActive ? '🎯' : '📁'} {layer.name}
                    </span>
                    <span className='flex gap-1'>
                      {layer.locked && '🔒'}
                      {!layer.visible && '👁️‍🗨️'}
                    </span>
                  </button>

                  <ul className='ml-4 space-y-1 border-l-2 border-slate-200 pl-2'>
                    {layer.nodes.map(
                      (node: CanvasNode & { locked?: boolean }) => {
                        const isSelected = selectedIds.includes(node.id);
                        return (
                          <li key={node.id} className='flex items-center gap-1'>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                selectionCommands.selectOnly(node.id);
                                layerCommands.setActiveLayer(layer.id);
                              }}
                              className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition ${
                                isSelected
                                  ? 'bg-sky-100 font-semibold text-sky-900'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                              }`}
                            >
                              📄 {node.name}
                            </button>
                          </li>
                        );
                      },
                    )}
                    {layer.nodes.length === 0 && (
                      <li className='py-1 text-[10px] text-slate-400 italic'>
                        No nodes in this layer
                      </li>
                    )}
                  </ul>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4'>
          <p className='text-sm font-semibold text-slate-800'>Konva Editor</p>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={undoCommand}
              className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700'
            >
              Undo
            </button>
            <button
              type='button'
              onClick={redoCommand}
              className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700'
            >
              Redo
            </button>
          </div>
        </header>

        <main className='size-full min-h-0'>
          <Outlet />
        </main>
      </div>

      <aside
        role='RightPanel'
        className='w-80 shrink-0 space-y-4 border-l border-slate-200 bg-white p-4'
      >
        <SectionCard title='Properties'>
          <div className='space-y-3 text-sm'>
            <div>
              <p className='text-xs text-slate-500'>선택 객체</p>
              <p className='font-medium text-slate-800'>
                {selectedNode?.name ?? '선택 없음'}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-2 text-xs'>
              <Property
                label='X'
                type='number'
                value={selectedNode ? Math.round(selectedNode.x) : ''}
                disabled={!selectedNode}
                onUpdate={(val) => updateSelectedNode({ x: Number(val) })}
              />
              <Property
                label='Y'
                type='number'
                value={selectedNode ? Math.round(selectedNode.y) : ''}
                disabled={!selectedNode}
                onUpdate={(val) => updateSelectedNode({ y: Number(val) })}
              />
            </div>

            <div className='grid grid-cols-2 gap-2 text-xs'>
              <Property
                label='Width'
                type='number'
                value={selectedNode ? Math.round(selectedNode.width) : ''}
                disabled={!selectedNode}
                onUpdate={(val) => updateSelectedNode({ width: Number(val) })}
              />
              <Property
                label='Height'
                type='number'
                value={selectedNode ? Math.round(selectedNode.height) : ''}
                disabled={!selectedNode}
                onUpdate={(val) => updateSelectedNode({ height: Number(val) })}
              />
            </div>

            <div className='grid grid-cols-2 gap-2 text-xs'>
              <Property
                label='Opacity'
                type='number'
                value={selectedNode?.opacity ?? 100}
                disabled={!selectedNode}
                onUpdate={(val) => updateSelectedNode({ opacity: Number(val) })}
              />
              <Property
                label='Rotation'
                type='number'
                value={selectedNode?.rotation ?? 0}
                disabled={!selectedNode}
                onUpdate={(val) =>
                  updateSelectedNode({ rotation: Number(val) })
                }
              />
            </div>

            <div className='grid grid-cols-2 gap-2 text-xs'>
              {selectedNode?.type !== 'image' && (
                <>
                  <Property
                    label='Fill'
                    type='color'
                    value={selectedNode?.fill ?? '#000000'}
                    disabled={!selectedNode}
                    onUpdate={(val) =>
                      updateSelectedNode({ fill: String(val) })
                    }
                  />
                  <Property
                    label='Stroke'
                    type='color'
                    value={selectedNode?.stroke ?? '#000000'}
                    disabled={!selectedNode}
                    onUpdate={(val) =>
                      updateSelectedNode({ stroke: String(val) })
                    }
                  />
                </>
              )}
            </div>
          </div>
        </SectionCard>
      </aside>
    </div>
  );
}

function Property(props: Parameters<typeof PropertyInput>[0]) {
  return (
    <div className='rounded-lg bg-slate-100 px-3 py-2'>
      <PropertyInput {...props} />
    </div>
  );
}
