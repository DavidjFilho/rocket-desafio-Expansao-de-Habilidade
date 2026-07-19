import { cn } from '@/utils/format'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-8 animate-spin rounded-full border-2 border-border border-t-primary',
        className,
      )}
      role="status"
      aria-label="Carregando"
    />
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="text-base font-medium text-text">{title}</p>
      <p className="max-w-md text-sm text-muted">{description}</p>
    </div>
  )
}

export function ErrorState({ message = 'Não foi possível carregar os dados. Tente novamente.' }: { message?: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-danger">
      {message}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-border/70', className)} />
}
