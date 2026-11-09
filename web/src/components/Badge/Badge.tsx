import { ComponentProps } from 'react';

const VARIANTS = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  neutral: 'bg-slate-100 text-slate-700',
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export type BadgeProps = ComponentProps<'span'> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = 'neutral',
  className = '',
  ...spanProps
}: BadgeProps) {
  return (
    <span
      {...spanProps}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-medium ${VARIANTS[variant]} ${className}`}
    />
  );
}
