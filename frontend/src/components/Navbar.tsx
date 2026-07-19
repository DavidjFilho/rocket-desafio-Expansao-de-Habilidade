import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/format'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transações' },
  { to: '/categories', label: 'Categorias' },
]

export function Navbar() {
  const { user } = useAuth()

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-[69px] max-w-[1280px] items-center justify-between px-4 sm:px-12">
        <Logo size="sm" />

        <nav className="hidden items-center gap-5 md:flex" aria-label="Principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'text-sm transition',
                  isActive ? 'font-semibold text-primary' : 'font-normal text-secondary hover:text-text',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/profile" aria-label="Perfil" className="shrink-0">
          <Avatar name={user?.name || 'U'} />
        </Link>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 md:hidden" aria-label="Mobile">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap text-sm',
                isActive ? 'font-semibold text-primary' : 'text-secondary',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
