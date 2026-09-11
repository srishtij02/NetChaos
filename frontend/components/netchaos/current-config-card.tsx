'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  formatBandwidth,
  formatLatency,
  formatTimeout,
} from '@/lib/format'
import { PROXY_INFO, type ChaosConfig } from '@/lib/netchaos-api'

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'default' | 'destructive' | 'warning'
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-sm',
          tone === 'destructive' && 'text-destructive',
          tone === 'warning' && 'text-warning',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/** Read-only snapshot of the backend-confirmed configuration + proxy topology. */
export function CurrentConfigCard({ config }: { config: ChaosConfig | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Configuration</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {config ? (
          <>
            <div className="divide-y divide-border">
              <Row
                label="Latency"
                value={formatLatency(config.latency_seconds)}
                tone={config.latency_seconds > 0 ? 'warning' : 'default'}
              />
              <Row label="Bandwidth" value={formatBandwidth(config.bandwidth_kbps)} />
              <Row label="Timeout" value={formatTimeout(config.timeout_seconds)} />
              <Row
                label="Drop Connections"
                value={config.drop_connection ? 'ON' : 'OFF'}
                tone={config.drop_connection ? 'destructive' : 'default'}
              />
            </div>

            <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Proxy
                </span>
                <span className="font-mono text-xs">
                  {PROXY_INFO.listenHost}:{PROXY_INFO.listenPort}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Upstream
                </span>
                <span className="font-mono text-xs">
                  {PROXY_INFO.upstreamHost}:{PROXY_INFO.upstreamPort}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No configuration loaded.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
