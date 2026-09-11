import { Dashboard } from '@/components/netchaos/dashboard'
import { ToastProvider } from '@/components/ui/toast'

export default function Page() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  )
}
