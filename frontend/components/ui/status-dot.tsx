import { cn } from '@/lib/utils'

type Tone = 'success' | 'destructive' | 'warning' | 'muted' | 'primary'

const toneClass: Record<Tone, string> = {
  success: 'bg-success',
  destructive: 'bg-destructive',
  warning: 'bg-warning',
  muted: 'bg-muted-foreground',
  primary: 'bg-primary',
}

/** A small status dot with an optional pulsing halo for "live" states. */
export function StatusDot({
  tone = 'muted',
  pulse = false,
  className,
}: {
  tone?: Tone
  pulse?: boolean
  className?: string
}) {
  return (
    <span className={cn('relative flex size-2.5 items-center justify-center', className)}>
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex size-full animate-ping rounded-full opacity-60',
            toneClass[tone],
          )}
        />
      )}
      <span className={cn('relative inline-flex size-2 rounded-full', toneClass[tone])} />
    </span>
  )
}
