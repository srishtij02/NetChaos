/**
 * NetChaos API service layer.
 *
 * All communication with the FastAPI backend lives here so the rest of the UI
 * never touches `fetch` directly. The backend runs locally, so requests may
 * fail when the dashboard is opened somewhere the local process is not
 * reachable — every call surfaces those failures instead of hiding them.
 *
 * Backend (FastAPI):
 *   GET  /        -> { name, status }
 *   GET  /health  -> { status }
 *   GET  /config  -> ChaosConfig
 *   POST /config  -> ChaosConfig   (accepts a ChaosConfig body)
 */

// Base URL of the FastAPI backend. Override with NEXT_PUBLIC_NETCHAOS_API_URL
// (e.g. when the proxy/backend runs on a different host or port).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_NETCHAOS_API_URL?.replace(/\/$/, '') ??
  'http://127.0.0.1:8000'

// Static proxy topology reported by the backend. These are fixed deployment
// facts (not part of the mutable chaos config), so they are described here.
export const PROXY_INFO = {
  upstreamHost: '127.0.0.1',
  upstreamPort: 8000,
  listenHost: '127.0.0.1',
  listenPort: 9000,
} as const

/** Response shape of `GET /`. */
export interface RootStatus {
  name: string
  status: string
}

/** Response shape of `GET /health`. */
export interface HealthStatus {
  status: string
}

/** The mutable chaos configuration returned by `GET /config` and sent to `POST /config`. */
export interface ChaosConfig {
  latency_seconds: number
  timeout_seconds: number
  drop_connection: boolean
  bandwidth_kbps: number
}

/** Thrown for any failed request so callers can show a clear error state. */
export class NetChaosApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetChaosApiError'
  }
}

const DEFAULT_TIMEOUT_MS = 6000

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new NetChaosApiError(
        `Request to ${path} failed with status ${res.status}`,
      )
    }

    return (await res.json()) as T
  } catch (err) {
    if (err instanceof NetChaosApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new NetChaosApiError(`Request to ${path} timed out`)
    }
    // Network-level failure (backend unreachable, CORS, DNS, etc.)
    throw new NetChaosApiError(
      `Could not reach NetChaos at ${API_BASE_URL}. Is the backend running?`,
    )
  } finally {
    clearTimeout(timer)
  }
}

/** GET / — service identity + top-level status. */
export function getRootStatus() {
  return request<RootStatus>('/')
}

/** GET /health — lightweight liveness probe used by the live-status poller. */
export function getHealth() {
  return request<HealthStatus>('/health')
}

/** GET /config — current chaos configuration, used to populate all controls. */
export function getConfig() {
  return request<ChaosConfig>('/config')
}

/** POST /config — apply a new chaos configuration. Returns the persisted config. */
export function updateConfig(config: ChaosConfig) {
  return request<ChaosConfig>('/config', {
    method: 'POST',
    body: JSON.stringify(config),
  })
}
