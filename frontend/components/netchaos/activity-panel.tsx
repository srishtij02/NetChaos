'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatClock } from '@/lib/format'
import type { ActivityEntry, Severity } from '@/hooks/use-netchaos'

const severityColor: Record<Severity, string> = {
  info: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
}

const severityDot: Record<Severity, string> = {
  info: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
}

/**
 * Terminal-style activity feed. Entries are client-side UI events (config
 * changes, health transitions, refreshes) — not backend logs.
 */
export function ActivityPanel({
  activity,
  limit,
  className,
}: {
  activity: ActivityEntry[]
  limit?: number
  className?: string
}) {
  const entries = limit ? activity.slice(0, limit) : activity

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Activity</CardTitle>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          client events
        </span>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 pt-0">
        <div className="h-full overflow-y-auto rounded-lg border border-border bg-[oklch(0.13_0.006_265)] p-3 font-mono text-xs">
          {entries.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No activity yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="mt-1 shrink-0">
                    <span
                      className={cn(
                        'inline-block size-1.5 rounded-full',
                        severityDot[entry.severity],
                      )}
                    />
                  </span>
                  <span className="shrink-0 text-muted-foreground/70">
                    [{formatClock(entry.time)}]
                  </span>
                  <span className={cn('text-pretty', severityColor[entry.severity])}>
                    {entry.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
