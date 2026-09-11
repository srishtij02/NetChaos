'use client'

import { Menu, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConnectionBadge } from '@/components/netchaos/connection-badge'
import { cn } from '@/lib/utils'
import type { ConnectionState } from '@/hooks/use-netchaos'

export function TopHeader({
  health,
  onRefresh,
  refreshing,
  onOpenSidebar,
}: {
  health: ConnectionState
  onRefresh: () => void
  refreshing: boolean
  onOpenSidebar: () => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3.5 md:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="text-muted-foreground transition-colors hover:text-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold tracking-tight">
            Network Chaos Control
          </h1>
          <p className="hidden truncate text-sm text-muted-foreground sm:block">
            Inject controlled network failures into your local services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionBadge health={health} className="hidden sm:inline-flex" />
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
