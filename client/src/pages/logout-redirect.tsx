import { useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function LogoutRedirect() {
  const { adminLogout } = useAdminAuth();

  useEffect(() => {
    // Clear admin session
    adminLogout();
    
    // Redirect to main page immediately
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-electric border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Logging out and redirecting to main page...</p>
      </div>
    </div>
  );
}