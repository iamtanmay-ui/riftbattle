'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';

// Create a mock context
const ClerkContext = createContext({
  isSignedIn: false,
  user: null as any,
});

// Create a ClerkProvider component that uses our existing auth store
export function ClerkProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  // Map our auth store user to Clerk format
  const clerkUser = user && user.id ? {
    id: user.id.toString(),
    emailAddresses: [{ emailAddress: user.email || '' }]
  } : null;
  
  return (
    <ClerkContext.Provider value={{ isSignedIn: isAuthenticated, user: clerkUser }}>
      {children}
    </ClerkContext.Provider>
  );
}

// Export a hook that matches Clerk's useUser hook
export function useUser() {
  return useContext(ClerkContext);
}

// Mock other Clerk exports if needed
export const currentUser = async () => {
  return null;
};

export const auth = () => {
  return { userId: null };
}; 