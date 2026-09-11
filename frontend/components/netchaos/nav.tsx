import { Activity, LayoutDashboard, Settings, SlidersHorizontal } from 'lucide-react'

export type NavView = 'overview' | 'controls' | 'activity' | 'settings'

export const NAV_ITEMS: {
  id: NavView
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'controls', label: 'Chaos Controls', icon: SlidersHorizontal },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
]
