import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingState } from '../components/LoadingState';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="full-page-state">
        <LoadingState label="Checking administrator access..." />
      </main>
    );
  }

  if (!session || isAdmin !== true) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
