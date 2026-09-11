'use client'

import { Waypoints, X } from 'lucide-react'
import { StatusDot } from '@/components/ui/status-dot'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, type NavView } from '@/components/netchaos/nav'
import type { ConnectionState } from '@/hooks/use-netchaos'

export function Sidebar({
  active,
  onNavigate,
  health,
  open,
  onClose,
}: {
  active: NavView
  onNavigate: (view: NavView) => void
  health: ConnectionState
  open: boolean
  onClose: () => void
}) {
  const connected = health === 'healthy'

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:sticky md:top-0 md:h-svh md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-inset ring-primary/30">
              <Waypoints className="size-4 text-primary" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-semibold tracking-tight">NetChaos</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Chaos Engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                )}
              >
                <Icon
                  className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-md bg-card/60 px-2.5 py-2">
            <StatusDot tone={connected ? 'success' : 'destructive'} pulse={connected} />
            <div className="leading-tight">
              <p className="text-xs font-medium">
                {connected ? 'API Connected' : 'API Offline'}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">127.0.0.1:8000</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
