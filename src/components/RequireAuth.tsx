import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/supabase';
import type { ReactNode } from 'react';

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-soft">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;

  return children ? <>{children}</> : <Outlet />;
}

export function RoleRoute({ role }: { role: Role }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-soft">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role !== role) {
    return <Navigate to={`/dashboard/${profile.role}`} replace />;
  }

  return <Outlet />;
}
