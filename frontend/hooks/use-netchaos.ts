'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getConfig,
  getHealth,
  getMetrics,
  getRootStatus,
  updateConfig,
  type ChaosConfig,
  type NetChaosMetrics,
  type RootStatus,
} from '@/lib/netchaos-api'
import { formatBandwidth, formatLatency, formatTimeout } from '@/lib/format'

export type ConnectionState = 'connecting' | 'healthy' | 'lost'
export type Severity = 'info' | 'success' | 'warning' | 'error'

export interface ActivityEntry {
  id: number
  time: Date
  message: string
  severity: Severity
}

const HEALTH_POLL_MS = 5000
const METRICS_POLL_MS = 5000
let activitySeq = 0

export function useNetChaos() {
  const [config, setConfig] = useState<ChaosConfig | null>(null)
  const [draft, setDraft] = useState<ChaosConfig | null>(null)
  const [rootStatus, setRootStatus] = useState<RootStatus | null>(null)
  const [metrics, setMetrics] = useState<NetChaosMetrics | null>(null)
  const [health, setHealth] = useState<ConnectionState>('connecting')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[]>([])

  const prevHealth = useRef<ConnectionState>('connecting')

  const log = useCallback((message: string, severity: Severity = 'info') => {
    setActivity((prev) =>
      [
        { id: ++activitySeq, time: new Date(), message, severity },
        ...prev,
      ].slice(0, 100),
    )
  }, [])

  /** Load config + service identity from the backend. */
  const loadConfig = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const [cfg, root] = await Promise.all([
        getConfig(),
        getRootStatus().catch(() => null),
      ])

      setConfig(cfg)
      setDraft(cfg)

      if (root) setRootStatus(root)

      log('Configuration loaded from backend', 'success')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load configuration'

      setLoadError(message)
      log(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [log])

  /** Fetch live proxy metrics. */
  const loadMetrics = useCallback(async () => {
    try {
      const data = await getMetrics()
      setMetrics(data)
    } catch (err) {
      console.error('Failed to load metrics:', err)
    }
  }, [])

  /** One-shot health probe. */
  const checkHealth = useCallback(async () => {
    try {
      const res = await getHealth()

      const next: ConnectionState =
        res.status === 'healthy' ? 'healthy' : 'lost'

      setHealth(next)

      if (prevHealth.current !== next) {
        if (next === 'healthy') {
          log('Health check → Healthy', 'success')
        } else {
          log('Health check → Connection lost', 'error')
        }

        prevHealth.current = next
      }
    } catch {
      setHealth('lost')

      if (prevHealth.current !== 'lost') {
        log('Health check → Connection lost', 'error')
        prevHealth.current = 'lost'
      }
    }
  }, [log])

  // Initial load + recurring health poll.
  useEffect(() => {
    loadConfig()
    checkHealth()
    loadMetrics()

    const healthTimer = setInterval(
      checkHealth,
      HEALTH_POLL_MS,
    )

    const metricsTimer = setInterval(
      loadMetrics,
      METRICS_POLL_MS,
    )

    return () => {
      clearInterval(healthTimer)
      clearInterval(metricsTimer)
    }
  }, [loadConfig, checkHealth, loadMetrics])

  /** Update the working draft locally. */
  const updateDraft = useCallback((patch: Partial<ChaosConfig>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  /** Whether the draft differs from backend config. */
  const dirty =
    !!config &&
    !!draft &&
    (config.latency_seconds !== draft.latency_seconds ||
      config.timeout_seconds !== draft.timeout_seconds ||
      config.bandwidth_kbps !== draft.bandwidth_kbps ||
      config.drop_connection !== draft.drop_connection)

  /** POST the draft to the backend. */
  const apply = useCallback(async () => {
    if (!draft) return

    setApplying(true)

    try {
      const saved = await updateConfig(draft)

      if (config) {
        if (config.latency_seconds !== saved.latency_seconds)
          log(
            `Latency → ${formatLatency(saved.latency_seconds)}`,
            'info',
          )

        if (config.bandwidth_kbps !== saved.bandwidth_kbps)
          log(
            `Bandwidth limit → ${formatBandwidth(saved.bandwidth_kbps)}`,
            'info',
          )

        if (config.timeout_seconds !== saved.timeout_seconds)
          log(
            `Timeout → ${formatTimeout(saved.timeout_seconds)}`,
            'info',
          )

        if (config.drop_connection !== saved.drop_connection)
          log(
            `Drop connections → ${
              saved.drop_connection ? 'ON' : 'OFF'
            }`,
            saved.drop_connection ? 'warning' : 'info',
          )
      }

      setConfig(saved)
      setDraft(saved)

      log('Configuration applied', 'success')

      return { ok: true as const }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to apply configuration'

      log(message, 'error')

      return {
        ok: false as const,
        error: message,
      }
    } finally {
      setApplying(false)
    }
  }, [draft, config, log])

  /** Discard local edits. */
  const resetDraft = useCallback(() => {
    setDraft(config)

    if (config) {
      log('Pending changes discarded', 'info')
    }
  }, [config, log])

  /** Manually refresh config, health, and metrics. */
  const refresh = useCallback(() => {
    log('Manual refresh requested', 'info')
    loadConfig()
    checkHealth()
    loadMetrics()
  }, [loadConfig, checkHealth, loadMetrics, log])

  return {
    config,
    draft,
    rootStatus,
    metrics,
    health,
    loading,
    applying,
    loadError,
    activity,
    dirty,
    updateDraft,
    apply,
    resetDraft,
    refresh,
  }
}