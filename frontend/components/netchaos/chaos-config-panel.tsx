'use client'

import { useId } from 'react'
import { CheckCircle2, Info, Loader2, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatBandwidth, formatLatency, formatTimeout } from '@/lib/format'
import type { ChaosConfig } from '@/lib/netchaos-api'

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

/** A single labelled slider + numeric input control. */
function ControlBlock({
  label,
  hint,
  displayValue,
  description,
  value,
  min,
  max,
  step,
  unit,
  disabled,
  onChange,
}: {
  label: string
  hint: string
  displayValue: string
  description: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const inputId = useId()
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <label htmlFor={inputId} className="text-sm font-medium">
            {label}
          </label>
          <Tooltip content={hint}>
            <Info className="size-3.5 text-muted-foreground" />
          </Tooltip>
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {displayValue}
        </span>
      </div>

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground text-pretty">{description}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <input
            id={inputId}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
            className="h-8 w-20 rounded-md border border-input bg-background px-2 text-right font-mono text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
          />
          <span className="w-10 font-mono text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  )
}

export function ChaosConfigPanel({
  draft,
  applying,
  dirty,
  onChange,
  onApply,
  onReset,
}: {
  draft: ChaosConfig | null
  applying: boolean
  dirty: boolean
  onChange: (patch: Partial<ChaosConfig>) => void
  onApply: () => void
  onReset: () => void
}) {
  const disabled = !draft

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-base">Chaos Configuration</CardTitle>
        <CardDescription>
          Control the network conditions applied by NetChaos.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-7 pt-6">
        <ControlBlock
          label="Latency"
          hint="Delay applied before each request is forwarded to the upstream."
          displayValue={draft ? formatLatency(draft.latency_seconds) : '—'}
          description="Artificial delay added before traffic is forwarded."
          value={draft?.latency_seconds ?? 0}
          min={0}
          max={10}
          step={0.1}
          unit="s"
          disabled={disabled}
          onChange={(v) => onChange({ latency_seconds: v })}
        />

        <div className="h-px bg-border" />

        <ControlBlock
          label="Bandwidth"
          hint="Throughput cap for traffic passing through the proxy. 0 disables the cap."
          displayValue={draft ? formatBandwidth(draft.bandwidth_kbps) : '—'}
          description="Limit the amount of data that can pass through the proxy. 0 = Unlimited."
          value={draft?.bandwidth_kbps ?? 0}
          min={0}
          max={10000}
          step={100}
          unit="KB/s"
          disabled={disabled}
          onChange={(v) => onChange({ bandwidth_kbps: v })}
        />

        <div className="h-px bg-border" />

        <ControlBlock
          label="Connection Timeout"
          hint="Idle connections are closed once this period elapses."
          displayValue={draft ? formatTimeout(draft.timeout_seconds) : '—'}
          description="Close inactive connections after the specified period."
          value={draft?.timeout_seconds ?? 1}
          min={1}
          max={60}
          step={1}
          unit="s"
          disabled={disabled}
          onChange={(v) => onChange({ timeout_seconds: v })}
        />

        {/* Destructive control — visually separated from the tuning sliders. */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            draft?.drop_connection
              ? 'border-destructive/40 bg-destructive/10'
              : 'border-border bg-muted/20',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TriangleAlert
                  className={cn(
                    'size-3.5',
                    draft?.drop_connection ? 'text-destructive' : 'text-muted-foreground',
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    draft?.drop_connection && 'text-destructive',
                  )}
                >
                  Drop Connections
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-pretty">
                Intentionally terminate incoming connections. This is a destructive
                chaos mode.
              </p>
            </div>
            <Switch
              checked={draft?.drop_connection ?? false}
              onCheckedChange={(checked) => onChange({ drop_connection: checked })}
              disabled={disabled}
              tone="destructive"
              aria-label="Drop connections"
            />
          </div>
        </div>
      </CardContent>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="min-h-4 text-xs text-muted-foreground">
          {dirty ? (
            <span className="inline-flex items-center gap-1.5 text-warning">
              <span className="size-1.5 rounded-full bg-warning" />
              Unsaved changes
            </span>
          ) : draft ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" />
              In sync with backend
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <Button variant="ghost" size="default" onClick={onReset} disabled={applying}>
              Discard
            </Button>
          )}
          <Button onClick={onApply} disabled={disabled || applying || !dirty}>
            {applying ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Applying…
              </>
            ) : (
              'Apply Configuration'
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
