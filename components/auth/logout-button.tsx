'use client';

import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/atoms';
import { useAuthStore } from '@/lib/store';
import { AuthStorage } from '@/lib/auth-storage';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api-client';

export function LogoutButton() {
  const [, setJotaiUser] = useAtom(userAtom);
  const setZustandUser = useAuthStore((state) => state.setUser);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Clear authentication data from localStorage first
      AuthStorage.clearAuthData();

      // Clear user data from state management
      setJotaiUser(null);
      setZustandUser(null);

      // Call logout API endpoint
      await api.auth.logout();

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="w-full justify-start"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
} 