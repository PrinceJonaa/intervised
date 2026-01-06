/**
 * Auth Provider - React context for authentication
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, type UseAuthReturn } from '../hooks/useAuth';

// Create context
const AuthContext = createContext<UseAuthReturn | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Protected route wrapper component
export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback = null,
}: { 
  children: ReactNode;
  requiredRole?: 'admin' | 'contributor' | 'member';
  fallback?: ReactNode;
}) {
  const { isLoading, isAuthenticated, isAdmin, isContributor, profile } = useAuthContext();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return fallback;
  }

  // Check role if required
  if (requiredRole) {
    const hasRole = 
      requiredRole === 'member' ||
      (requiredRole === 'contributor' && isContributor) ||
      (requiredRole === 'admin' && isAdmin);

    if (!hasRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-void">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access this page.</p>
            <p className="text-gray-500 text-sm mt-2">Required role: {requiredRole}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export default AuthProvider;
