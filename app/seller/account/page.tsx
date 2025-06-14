'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkinsCollector } from '@/components/seller/skins-collector';
import { AthenaIdsManager } from '@/components/seller/athena-ids-manager';
import { SellerInfoManager } from '@/components/seller/seller-info-manager';

export default function SellerAccountPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySellerRole = async () => {
      try {
        const response = await fetch('/api/get_role');
        if (!response.ok) {
          router.push('/');
          return;
        }
        const role = await response.text();
        setIsSeller(role === 'seller');
        if (role !== 'seller') {
          router.push('/');
        }
      } catch (error) {
        console.error('Error verifying seller role:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      verifySellerRole();
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (loading || !isAuthenticated || !isSeller) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seller Account Settings</h1>
        <Button onClick={() => router.push('/seller')}>
          <Settings className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{user?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="mt-1">Seller</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Balance</h3>
              <p className="mt-1">${user?.balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="skins" className="space-y-6">
        <TabsList>
          <TabsTrigger value="skins">Skins Collection</TabsTrigger>
          <TabsTrigger value="athena">Athena IDs</TabsTrigger>
          <TabsTrigger value="info">Seller Info</TabsTrigger>
        </TabsList>

        <TabsContent value="skins">
          <Card>
            <CardHeader>
              <CardTitle>Collect Skins Information</CardTitle>
            </CardHeader>
            <CardContent>
              <SkinsCollector />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="athena">
          <Card>
            <CardHeader>
              <CardTitle>Manage Athena IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <AthenaIdsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <SellerInfoManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 