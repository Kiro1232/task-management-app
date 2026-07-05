import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Button';
import { LogoutIcon } from '../UI/Icons';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-200"
              aria-hidden="true"
            >
              <span className="text-base font-bold">T</span>
            </span>
            <span className="text-xl font-bold text-slate-900">TaskManager</span>
          </div>

          {/* User controls */}
          {user && (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-slate-500">
                Hello, <span className="font-semibold text-slate-800">{user.name}</span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
