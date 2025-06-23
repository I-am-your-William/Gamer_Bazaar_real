import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminLogin: () => void;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const adminStatus = localStorage.getItem('admin_logged_in');
    console.log('Admin auth status from localStorage:', adminStatus);
    setIsAdminLoggedIn(adminStatus === 'true');
  }, []);

  const adminLogin = () => {
    console.log('Admin logging in...');
    localStorage.setItem('admin_logged_in', 'true');
    setIsAdminLoggedIn(true);
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsAdminLoggedIn(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}