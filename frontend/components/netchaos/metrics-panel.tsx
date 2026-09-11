'use client'

import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock3,
  Gauge,
  Network,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { NetChaosMetrics } from '@/lib/netchaos-api'

interface MetricsPanelProps {
  metrics: NetChaosMetrics | null
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  const items = [
    {
      label: 'Active Connections',
      value: metrics?.active_connections ?? 0,
      icon: Network,
    },
    {
      label: 'Total Connections',
      value: metrics?.total_connections ?? 0,
      icon: Activity,
    },
    {
      label: 'Dropped Connections',
      value: metrics?.dropped_connections ?? 0,
      icon: XCircle,
    },
    {
      label: 'Timeouts',
      value: metrics?.timeouts ?? 0,
      icon: Clock3,
    },
    {
      label: 'Connection Errors',
      value: metrics?.connection_errors ?? 0,
      icon: RotateCcw,
    },
    {
      label: 'Client → Server',
      value: formatBytes(metrics?.bytes_client_to_server ?? 0),
      icon: ArrowUpFromLine,
    },
    {
      label: 'Server → Client',
      value: formatBytes(metrics?.bytes_server_to_client ?? 0),
      icon: ArrowDownToLine,
    },
  ]

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Live Metrics
          </h2>

          <p className="text-sm text-muted-foreground">
            Real-time proxy traffic and connection statistics.
          </p>
        </div>

        <Gauge className="size-4 text-muted-foreground" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Card
              key={item.label}
              className="p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>

                  <p className="mt-1 font-mono text-sm text-foreground">
                    {item.value}
                  </p>
                </div>

                <Icon className="size-4 text-muted-foreground" />
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}