import { PropsWithChildren } from 'react';

export default function SectionCard({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) {
  return (
    <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <h2 className='text-sm font-semibold text-slate-800'>{title}</h2>
      <div className='mt-3 text-sm'>{children}</div>
    </section>
  );
}
