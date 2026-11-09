import { ComponentProps, useId } from 'react';

export type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  label: string;
  error?: string;
};

export function TextField({
  label,
  error,
  className = '',
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const colors = error
    ? 'border-red-600 focus:border-red-600 focus:ring-red-700/30'
    : 'border-ink/20 focus:border-blue-600 focus:ring-blue-700/30';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none ${colors} ${className}`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
