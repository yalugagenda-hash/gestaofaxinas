import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
      <button className="lg:hidden" onClick={onMenuClick}>
        <Menu size={22} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button onClick={() => signOut()} className="btn-secondary !px-3 !py-1.5">
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  )
}
