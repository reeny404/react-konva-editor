import { cn } from '@/utils/style';

type Props = {
  label: string;
  value: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  className?: string;
};

export default function ToggleButton({
  label,
  value,
  disabled,
  onChange,
  className,
}: Props) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        'group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-all hover:border-slate-300 disabled:opacity-50',
        value && 'border-sky-200 bg-sky-50',
        className,
      )}
    >
      <span
        className={cn(
          'text-xs font-semibold transition-colors',
          value ? 'text-sky-700' : 'text-slate-600',
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          'relative h-4 w-7 rounded-full transition-colors duration-200 ease-in-out',
          value ? 'bg-sky-500' : 'bg-slate-300',
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
            value ? 'translate-x-3' : 'translate-x-0',
          )}
        />
      </div>
    </button>
  );
}
