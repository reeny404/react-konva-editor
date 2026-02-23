import type { ReactNode } from 'react';
import Panel from './Panel';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className='flex h-screen w-screen overflow-hidden bg-slate-100'>
      <aside
        role='LeftPanel'
        className='hidden w-72 shrink-0 border-r border-slate-200 bg-slate-50 p-4 lg:block'
      >
        <div className='space-y-4'>
          <Panel title='롤 패널'>
            <div className='space-y-2 text-sm text-slate-600'>
              <button
                type='button'
                className='w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left font-medium text-sky-800'
              >
                Rect 선택
              </button>
              <p className='text-xs text-slate-500'>
                이후 Circle, Text, Image 등을 여기에 추가하면 됩니다.
              </p>
            </div>
          </Panel>

          <Panel title='레이어'>
            <ul className='space-y-2 text-sm text-slate-700'>
              <li className='rounded-lg border border-slate-200 px-3 py-2'>
                Rectangle 1
              </li>
            </ul>
          </Panel>
        </div>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4'>
          <div>
            <p className='text-sm font-semibold text-slate-800'>Konva Editor</p>
            <p className='text-xs text-slate-500'>React + TypeScript + Vite</p>
          </div>
          <div className='text-xs text-slate-500'>좌우 패널 레이아웃</div>
        </header>

        <main className='min-h-0 flex-1'>{children}</main>
      </div>

      <aside
        role='RightPanel'
        className='hidden w-80 shrink-0 border-l border-slate-200 bg-white p-4 xl:block'
      >
        <div className='space-y-4'>
          <Panel title='properties panel'>
            <div className='space-y-3 text-sm'>
              <div>
                <p className='text-xs text-slate-500'>선택 객체</p>
                <p className='font-medium text-slate-800'>Rectangle 1</p>
              </div>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='rounded-lg bg-slate-100 px-3 py-2'>
                  <p className='text-slate-500'>Fill</p>
                  <p className='mt-1 font-medium text-slate-700'>#0f172a</p>
                </div>
                <div className='rounded-lg bg-slate-100 px-3 py-2'>
                  <p className='text-slate-500'>Stroke</p>
                  <p className='mt-1 font-medium text-slate-700'>#38bdf8</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title='guide panel'>
            <p className='text-sm leading-6 text-slate-600'>
              중앙 캔버스에서 사각형을 드래그해 이동할 수 있습니다.
            </p>
          </Panel>
        </div>
      </aside>
    </div>
  );
}
