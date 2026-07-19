import { getCategoryTextColor } from '@/utils/categories'
import { cn } from '@/utils/format'

type TagProps = {
  label: string
  color?: string
  className?: string
}

export function Tag({ label, color = '#dbeafe', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap',
        className,
      )}
      style={{ backgroundColor: color, color: getCategoryTextColor(color) }}
    >
      {label}
    </span>
  )
}
