'use client'

import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** Destructive switches turn on with the destructive color instead of primary. */
  tone?: 'primary' | 'destructive'
  'aria-label'?: string
  id?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  tone = 'primary',
  id,
  ...props
}: SwitchProps) {
  const onColor =
    tone === 'destructive' ? 'bg-destructive' : 'bg-primary'

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? onColor : 'bg-muted',
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
