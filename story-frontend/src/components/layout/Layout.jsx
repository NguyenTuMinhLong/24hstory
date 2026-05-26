import { Link, useLocation } from 'react-router-dom'
import { Home, PlusSquare, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import useAuthStore from '@/stores/authStore'

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link
    to={to}
    className={cn(
      'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
      isActive ? 'text-primary' : 'text-secondary hover:text-text'
    )}
  >
    <Icon size={24} />
    <span className="text-xs">{label}</span>
  </Link>
)

const Header = () => {
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-text">24h</span>
          <span className="text-xl font-light text-primary">Story</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Avatar src={user.avatar} alt={user.email} size="sm" />
            </Link>
            <button
              onClick={logout}
              className="text-secondary hover:text-error transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

const BottomNav = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  if (!user) return null

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/stories', icon: PlusSquare, label: 'Create' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            isActive={location.pathname === item.to}
          />
        ))}
      </div>
    </nav>
  )
}

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 pb-20 pt-4 md:pb-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export { Layout, Header, BottomNav }
