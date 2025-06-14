"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    console.log('Seller Layout - Auth Check:', { 
      isAuthenticated, 
      userRole: user?.role,
      userId: user?.id 
    });

    // Redirect if not authenticated or not a seller/admin
    if (!isAuthenticated || !(user?.role === 'seller' || user?.role === 'admin')) {
      console.log('Unauthorized access attempt to seller area');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Don't render anything if not authorized
  if (!isAuthenticated || !(user?.role === 'seller' || user?.role === 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
} 