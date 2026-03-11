import React from 'react';

type PropertyInputProps = {
  value: string | number;
  label: string;
  type?: 'text' | 'number' | 'color';
  onUpdate: (val: string | number) => void;
  disabled?: boolean;
};

export function PropertyInput({
  value,
  label,
  type = 'text',
  onUpdate,
  disabled = false,
}: PropertyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const val = e.target.value;

    if (type === 'number') {
      const num = Number(val);
      if (!isNaN(num)) {
        onUpdate(num);
      }
      return;
    }

    onUpdate(val);
  };

  return (
    <div className='flex flex-col'>
      <label className='mb-1 text-xs text-slate-500'>{label}</label>

      {disabled ? (
        <div className='flex h-7 items-center rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-400'>
          -
        </div>
      ) : (
        <input
          type={type}
          className='h-7 w-full rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
