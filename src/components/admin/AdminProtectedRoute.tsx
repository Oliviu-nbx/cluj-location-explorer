
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('User not authenticated, redirecting to login');
    } else if (!isLoading && !isAdmin) {
      console.log('User is not an admin, access denied');
    }
  }, [user, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Verifying access...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return path
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    // User is logged in but not an admin
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You don't have permission to access this area.</p>
        <p className="text-sm text-muted-foreground">
          Please contact an administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  // User is authenticated and has admin privileges
  return <>{children}</>;
}

export default AdminProtectedRoute;
