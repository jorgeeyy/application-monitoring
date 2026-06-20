import { Toaster as SonnerToaster } from 'sonner'
import { cn } from '@/lib/utils'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      className={cn()}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-accent group-[.toast]:text-accent-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}
