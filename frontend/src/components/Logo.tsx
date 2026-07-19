import logo from '@/assets/logo.png'
import { Link } from 'react-router-dom'

export function Logo({ to = '/', size = 'md' }: { to?: string; size?: 'sm' | 'md' }) {
  return (
    <Link to={to} className="inline-flex items-center" aria-label="Financy">
      <img
        src={logo}
        alt="Financy"
        className={size === 'sm' ? 'h-6 w-auto' : 'h-8 w-auto'}
      />
    </Link>
  )
}
