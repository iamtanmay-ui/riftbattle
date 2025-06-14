"use client";

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Package, Shield, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface OrderDetails {
  id: number;
  product_id: number;
  name: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  warranty: number;
  date: number;
  seller: {
    id: number;
    name: string;
    rating: number;
  };
  credentials?: {
    email: string;
    password: string;
  };
  stats: {
    level: string;
    backpacks: string;
    [key: string]: string;
  };
}

const mockOrderDetails: OrderDetails = {
  id: 1,
  product_id: 1,
  name: "Rare Fortnite Account",
  price: 99.99,
  status: "completed",
  warranty: 3,
  date: Date.now() - 86400000,
  seller: {
    id: 1,
    name: "Premium Seller",
    rating: 4.9
  },
  credentials: {
    email: "account@example.com",
    password: "********"
  },
  stats: {
    level: "100",
    backpacks: "500",
    skins: "50",
    emotes: "30"
  }
};

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-500",
  completed: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500"
};

const statusIcons = {
  pending: Clock,
  completed: CheckCircle2,
  cancelled: XCircle
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const orderId = parseInt(params.id as string, 10);

  // TODO: Replace with actual API call
  const { data: order, isLoading } = useQuery<OrderDetails>({
    queryKey: ['order', orderId],
    queryFn: () => Promise.resolve(mockOrderDetails),
    enabled: isAuthenticated && !!orderId,
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  if (!order) return null;

  const StatusIcon = statusIcons[order.status];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-8 text-gray-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                    <p className="text-gray-400 mt-1">
                      Placed on {format(order.date, 'MMMM d, yyyy')} at {format(order.date, 'h:mm a')}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(order.stats).map(([key, value]) => (
                      <div key={key} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1 capitalize">{key}</div>
                        <div className="text-white font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status === 'completed' && order.credentials && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Account Credentials</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Email</div>
                        <div className="text-white font-mono">{order.credentials.email}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Password</div>
                        <div className="text-white font-mono">{order.credentials.password}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white">${order.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Warranty</span>
                  <span className="text-white">{order.warranty} Months</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">${order.price}</span>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push(`/messages?order=${order.id}`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
                  <Shield className="h-4 w-4" />
                  <span>Protected by Rift Battle</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{order.seller.name}</p>
                    <p className="text-gray-400 text-sm">Rating: {order.seller.rating}/5</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}