import { documentCommands } from '@/commands/documentCommands';
import { redoCommand, undoCommand } from '@/commands/history';
import { selectionCommands } from '@/commands/selectionCommands';
import { PropertyInput } from '@/components/right-panel/PropertyInput';
import { routes } from '@/features/routes';
import { useSelectedNode } from '@/hooks/useSelectedNode';
import { useDocumentStore } from '@/stores/documentStore';
import { useSelectionStore } from '@/stores/selectionStore';
import type { SceneNode } from '@/types/node';
import { NavLink, Outlet } from 'react-router-dom';
import SectionCard from './SectionCard';

export default function AppLayout() {
  const nodes = useDocumentStore((state) => state.doc.nodes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectedNode = useSelectedNode();

  const updateSelectedNode = (patch: Partial<SceneNode>) => {
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
          <ul className='max-h-md space-y-2 overflow-y-auto text-sm'>
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

        <SectionCard title='Layers'>
          <div className='space-y-2 text-sm text-slate-600'>
            <button
              type='button'
              className='w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left font-medium text-sky-800'
            >
              Rect
            </button>
          </div>
        </SectionCard>

        <SectionCard title='Nodes'>
          <ul className='space-y-2 text-sm text-slate-700'>
            {nodes.map((node) => {
              const isSelected = selectedIds.includes(node.id);

              return (
                <li key={node.id}>
                  <button
                    type='button'
                    onClick={() => selectionCommands.selectOnly(node.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      isSelected
                        ? 'border-sky-200 bg-sky-50 font-medium text-sky-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {node.name}
                  </button>
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
