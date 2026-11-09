import { ComponentProps } from 'react';

const VARIANTS = {
  error: {
    container: 'border-red-200 border-l-red-400 bg-red-50',
    title: 'text-red-600',
  },
  warning: {
    container: 'border-amber-200 border-l-amber-400 bg-amber-50',
    title: 'text-amber-700',
  },
  success: {
    container: 'border-green-200 border-l-green-500 bg-green-50',
    title: 'text-green-700',
  },
  info: {
    container: 'border-blue-200 border-l-blue-400 bg-blue-50',
    title: 'text-blue-700',
  },
} as const;

export type AlertVariant = keyof typeof VARIANTS;

export type AlertProps = Omit<ComponentProps<'div'>, 'title'> & {
  title: string;
  variant?: AlertVariant;
};

export function Alert({
  title,
  variant = 'info',
  className = '',
  children,
  ...divProps
}: AlertProps) {
  const styles = VARIANTS[variant];

  return (
    <div
      role="alert"
      {...divProps}
      className={`rounded-xl border border-l-4 px-5 py-4 text-sm ${styles.container} ${className}`}
    >
      <p className={`font-medium ${styles.title}`}>{title}</p>
      {children && <div className="mt-1 text-slate-600">{children}</div>}
    </div>
  );
}
