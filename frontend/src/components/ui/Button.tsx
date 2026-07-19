import { cn } from '@/utils/format'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-white text-text border border-border hover:bg-bg',
  ghost: 'bg-transparent text-primary hover:bg-[#e0fae9]',
  danger: 'bg-white text-danger border border-border hover:bg-red-50',
  outline: 'bg-white text-secondary border border-border hover:bg-bg',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-12 px-4 text-sm',
  lg: 'h-12 px-4 text-base w-full',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  )
}
