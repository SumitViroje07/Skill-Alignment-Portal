import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  UserRound,
  Wrench,
  GitCompare,
  Briefcase,
  BookOpen,
  LogOut,
  Menu,
  Building2,
  School,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RequireAuth } from '@/components/RequireAuth';
import type { Role } from '@/lib/supabase';

const MENUS: Record<Role, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  student: [
    { to: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/student/profile', label: 'My Profile', icon: UserRound },
    { to: '/dashboard/student/skills', label: 'My Skills', icon: Wrench },
    { to: '/dashboard/student/gap-analysis', label: 'Skill Gap Analysis', icon: GitCompare },
    { to: '/dashboard/student/jobs', label: 'Jobs & Internships', icon: Briefcase },
    { to: '/dashboard/student/resources', label: 'Learning Resources', icon: BookOpen },
  ],
  company: [
    { to: '/dashboard/company', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/company/postings', label: 'My Postings', icon: Briefcase },
    { to: '/dashboard/company/applications', label: 'Applications', icon: Building2 },
  ],
  institution: [
    { to: '/dashboard/institution', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/institution/profile', label: 'Institution Profile', icon: School },
    { to: '/dashboard/institution/students', label: 'Students', icon: UserRound },
  ],
};

function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!profile) return null;

  const menu = MENUS[profile.role];
  const current = [...menu]
    .sort((a, b) => b.to.length - a.to.length)
    .find((m) => location.pathname.startsWith(m.to));
  const displayName = profile.full_name || 'My Account';

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-primary-500 to-primary-600 p-4">
      <div className="flex items-center gap-2 px-2 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
          <GraduationCap size={20} />
        </span>
        <span className="text-sm font-bold leading-tight text-white">
          Skill Alignment Portal
        </span>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/dashboard/${profile.role}`}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-600 shadow-sm'
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-100 transition-all duration-200 hover:bg-white/10 hover:text-white"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-soft">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-in">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-primary-100 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-ink hover:bg-primary-50 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <h1 className="text-lg font-bold text-ink">{current?.label ?? 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ink">{displayName}</p>
                <p className="text-xs capitalize text-ink-soft">{profile.role}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-sm font-bold text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayoutPage() {
  return (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  );
}
