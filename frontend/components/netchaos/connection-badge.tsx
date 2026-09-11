import { StatusDot } from '@/components/ui/status-dot'
import { cn } from '@/lib/utils'
import type { ConnectionState } from '@/hooks/use-netchaos'

const MAP: Record<
  ConnectionState,
  { label: string; tone: 'success' | 'destructive' | 'warning'; pulse: boolean; text: string }
> = {
  healthy: { label: 'Healthy', tone: 'success', pulse: true, text: 'text-success' },
  connecting: { label: 'Connecting…', tone: 'warning', pulse: true, text: 'text-warning' },
  lost: { label: 'Connection Lost', tone: 'destructive', pulse: false, text: 'text-destructive' },
}

/** Shared live connection indicator used in the header and sidebar. */
export function ConnectionBadge({
  health,
  className,
}: {
  health: ConnectionState
  className?: string
}) {
  const cfg = MAP[health]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      <StatusDot tone={cfg.tone} pulse={cfg.pulse} />
      <span className={cfg.text}>{cfg.label}</span>
    </span>
  )
}
