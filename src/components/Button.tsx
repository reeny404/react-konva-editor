import { cn } from '@/utils/style';
import type { ComponentProps } from 'react';

function Button({
  children,
  className,
  disabled,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'min-w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
