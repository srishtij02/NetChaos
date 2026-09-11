'use client'

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { StatusDot } from '@/components/ui/status-dot'
import { API_BASE_URL, PROXY_INFO, type RootStatus } from '@/lib/netchaos-api'
import type { ConnectionState } from '@/hooks/use-netchaos'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  )
}

export function SettingsView({
  rootStatus,
  health,
}: {
  rootStatus: RootStatus | null
  health: ConnectionState
}) {
  const online = health === 'healthy'

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Backend Connection</CardTitle>
          <CardDescription>
            Endpoint the dashboard talks to. Override with{' '}
            <code className="font-mono text-xs">NEXT_PUBLIC_NETCHAOS_API_URL</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            <InfoRow label="API Base URL" value={API_BASE_URL} />
            <InfoRow
              label="Service"
              value={rootStatus?.name ?? (online ? 'NetChaos' : '—')}
            />
            <InfoRow
              label="Status"
              value={
                <span className="inline-flex items-center gap-2">
                  <StatusDot tone={online ? 'success' : 'destructive'} pulse={online} />
                  {rootStatus?.status ?? (online ? 'running' : 'unreachable')}
                </span>
              }
            />
            <InfoRow label="Health Poll" value="every 5s" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proxy Topology</CardTitle>
          <CardDescription>
            Fixed listen and upstream targets reported by the backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            <InfoRow
              label="Listen Address"
              value={`${PROXY_INFO.listenHost}:${PROXY_INFO.listenPort}`}
            />
            <InfoRow
              label="Upstream Address"
              value={`${PROXY_INFO.upstreamHost}:${PROXY_INFO.upstreamPort}`}
            />
            <InfoRow label="Protocol" value="TCP" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
