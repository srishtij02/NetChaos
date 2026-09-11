import type { ChaosConfig } from '@/lib/netchaos-api'

/** Human-readable latency, e.g. `3.0 s`. */
export function formatLatency(seconds: number): string {
  return `${seconds.toFixed(1)} s`
}

/** Human-readable timeout, e.g. `5 s`. */
export function formatTimeout(seconds: number): string {
  return `${Math.round(seconds)} s`
}

/** Bandwidth, where 0 means uncapped. */
export function formatBandwidth(kbps: number): string {
  if (!kbps || kbps <= 0) return 'Unlimited'
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(kbps % 1000 === 0 ? 0 : 1)} MB/s`
  return `${Math.round(kbps)} KB/s`
}

/** Whether any chaos condition is actively being simulated. */
export function isChaosActive(config: ChaosConfig): boolean {
  return (
    config.drop_connection ||
    config.latency_seconds > 0 ||
    (config.bandwidth_kbps > 0 && config.bandwidth_kbps < 10000)
  )
}

/** `HH:MM:SS` timestamp for the activity log. */
export function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour12: false })
}
