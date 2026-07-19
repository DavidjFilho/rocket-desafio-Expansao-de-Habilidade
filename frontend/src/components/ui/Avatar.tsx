import { cn, getInitials } from '@/utils/format'

type AvatarProps = {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'size-9 text-sm',
  md: 'size-10 text-sm',
  lg: 'size-16 text-2xl',
}

export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-[#d1d5db] font-medium text-text',
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  )
}
