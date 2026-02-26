import type { ReactNode } from 'react';
import { redoCommand, undoCommand } from '../commands/history';
import { useSelectedNode } from '../selectors/documentSelectors';
import { useDocumentStore } from '../stores/documentStore';
import { useSelectionStore } from '../stores/selectionStore';
import SectionCard from './SectionCard';

type EditorLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: EditorLayoutProps) {
  const nodes = useDocumentStore((state) => state.doc.nodes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const selectOnly = useSelectionStore((state) => state.selectOnly);
  const selectedNode = useSelectedNode();

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-slate-100'>
      <aside
        role='LeftPanel'
        className='hidden w-72 shrink-0 border-r border-slate-200 bg-slate-50 p-4 lg:block'
      >
        <div className='space-y-4'>
          <SectionCard title='Nodes'>
            <div className='space-y-2 text-sm text-slate-600'>
              <button
                type='button'
                className='w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left font-medium text-sky-800'
              >
                Rect
              </button>
            </div>
          </SectionCard>

          <SectionCard title='Layers'>
            <ul className='space-y-2 text-sm text-slate-700'>
              {nodes.map((node) => {
                const isSelected = selectedIds.includes(node.id);

                return (
                  <li key={node.id}>
                    <button
                      type='button'
                      onClick={() => selectOnly(node.id)}
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
        </div>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4'>
          <div>
            <p className='text-sm font-semibold text-slate-800'>Konva Editor</p>
            <p className='text-xs text-slate-500'>React + TypeScript + Vite</p>
          </div>
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

        <main className='min-h-0 flex-1'>{children}</main>
      </div>

      <aside
        role='RightPanel'
        className='hidden w-80 shrink-0 border-l border-slate-200 bg-white p-4 xl:block'
      >
        <div className='space-y-4'>
          <SectionCard title='properties panel'>
            <div className='space-y-3 text-sm'>
              <div>
                <p className='text-xs text-slate-500'>선택 객체</p>
                <p className='font-medium text-slate-800'>
                  {selectedNode?.name ?? '선택 없음'}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='rounded-lg bg-slate-100 px-3 py-2'>
                  <p className='text-slate-500'>Fill</p>
                  <p className='mt-1 font-medium text-slate-700'>
                    {selectedNode?.fill ?? '-'}
                  </p>
                </div>
                <div className='rounded-lg bg-slate-100 px-3 py-2'>
                  <p className='text-slate-500'>Stroke</p>
                  <p className='mt-1 font-medium text-slate-700'>
                    {selectedNode?.stroke ?? '-'}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='rounded-lg bg-slate-100 px-3 py-2'>
                  <p className='text-slate-500'>X / Y</p>
                  <p className='mt-1 font-medium text-slate-700'>
                    {selectedNode
                      ? `${Math.round(selectedNode.x)} / ${Math.round(selectedNode.y)}`
                      : '-'}
                  </p>
                </div>
                <div className='rounded-lg bg-slate-100 px-3 py-2'>
                  <p className='text-slate-500'>Size</p>
                  <p className='mt-1 font-medium text-slate-700'>
                    {selectedNode
                      ? `${Math.round(selectedNode.width)} x ${Math.round(selectedNode.height)}`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title='memo'>
            [v] draggable <br />
            [ ] style: rounded-none <br />
            [ ] size changeable with draggable <br />
            [ ] rotation <br />
            [ ] mode: select, create, c - 드래그로 생성 or 데이터 받아 추가 r -
            db 데이터 wrapping 후 연결 u - panel/editor d - hot key <br />
          </SectionCard>
        </div>
      </aside>
    </div>
  );
}
