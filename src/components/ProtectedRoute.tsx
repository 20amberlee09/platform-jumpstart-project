import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
  requireCourseAccess?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole = 'user',
  redirectTo = '/auth',
  requireCourseAccess = false
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminData();
  const location = useLocation();
  const { toast } = useToast();

  // Show loading spinner while checking authentication
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Verifying access...</span>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    // Store the attempted URL for redirect after login
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // Check admin role requirement
  if (requiredRole === 'admin' && !isAdmin) {
    console.log('🔍 ProtectedRoute: Access denied for user:', user?.email, 'isAdmin:', isAdmin, 'requiredRole:', requiredRole);
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      variant: "destructive"
    });
    return <Navigate to="/" replace />;
  }

  console.log('🔍 ProtectedRoute: Access granted for user:', user?.email, 'isAdmin:', isAdmin, 'requiredRole:', requiredRole);

  // Check course access requirement
  if (requireCourseAccess) {
    // This would integrate with useCourseAccess hook
    // For now, assume all authenticated users have access
  }

  return <>{children}</>;
};

// Higher-order component for easier use
export const withAuth = (Component: React.ComponentType, requiredRole?: 'admin' | 'user') => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};