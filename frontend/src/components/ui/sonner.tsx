import { Toaster as SonnerToaster } from 'sonner'
import { cn } from '@/lib/utils'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      className={cn()}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-[#111] group-[.toaster]:text-foreground group-[.toaster]:border-[#222] group-[.toaster]:shadow-2xl',
          description: 'group-[.toast]:text-[#666]',
          actionButton: 'group-[.toast]:bg-white group-[.toast]:text-black',
          cancelButton: 'group-[.toast]:bg-[#222] group-[.toast]:text-[#999]',
        },
      }}
    />
  )
}
