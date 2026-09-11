'use client'

import { Server, Radio, Network, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusDot } from '@/components/ui/status-dot'
import { cn } from '@/lib/utils'
import { isChaosActive } from '@/lib/format'
import type { ChaosConfig } from '@/lib/netchaos-api'
import type { ConnectionState } from '@/hooks/use-netchaos'

type Tone = 'success' | 'destructive' | 'warning' | 'muted'

function StatCard({
  icon: Icon,
  label,
  address,
  status,
  tone,
  pulse,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  address: string
  status: string
  tone: Tone
  pulse?: boolean
}) {
  const textTone: Record<Tone, string> = {
    success: 'text-success',
    destructive: 'text-destructive',
    warning: 'text-warning',
    muted: 'text-muted-foreground',
  }
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted/60">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <StatusDot tone={tone} pulse={pulse} />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm text-foreground">{address}</p>
      <p className={cn('mt-2 text-sm font-medium', textTone[tone])}>{status}</p>
    </Card>
  )
}

export function StatusCards({
  health,
  config,
}: {
  health: ConnectionState
  config: ChaosConfig | null
}) {
  const online = health === 'healthy'
  const chaosActive = config ? isChaosActive(config) : false

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Server}
        label="API"
        address="127.0.0.1:8000"
        status={online ? 'Healthy' : 'Unreachable'}
        tone={online ? 'success' : 'destructive'}
        pulse={online}
      />
      <StatCard
        icon={Radio}
        label="Proxy"
        address="127.0.0.1:9000"
        status={online ? 'Running' : 'Unreachable'}
        tone={online ? 'success' : 'destructive'}
        pulse={online}
      />
      <StatCard
        icon={Network}
        label="Upstream"
        address="127.0.0.1:8001"
        status={online ? 'Connected' : 'Unreachable'}
        tone={online ? 'success' : 'destructive'}
      />
      <StatCard
        icon={Zap}
        label="Chaos Engine"
        address={config ? (chaosActive ? 'Injecting faults' : 'No active faults') : '—'}
        status={!config ? 'Unknown' : chaosActive ? 'Active' : 'Idle'}
        tone={!config ? 'muted' : chaosActive ? 'warning' : 'muted'}
        pulse={chaosActive}
      />
    </div>
  )
}
