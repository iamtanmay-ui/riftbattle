'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SellerListingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Redirect if not authenticated or not a seller/admin
    if (!isAuthenticated || !(user?.role === 'seller' || user?.role === 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Don't render anything if not a seller/admin
  if (!user || !(user.role === 'seller' || user.role === 'admin')) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button onClick={() => router.push('/seller/listings/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Listing
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No active listings yet. Click "Add New Listing" to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 