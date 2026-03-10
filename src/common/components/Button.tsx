import { cn } from '@/common/utils/style';
import type { ComponentProps } from 'react';

function Button({ children, className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:brightness-110',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
