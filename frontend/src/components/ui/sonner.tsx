import { Toaster as SonnerToaster } from 'sonner'
import { cn } from '@/lib/utils'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      className={cn()}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-accent group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}
