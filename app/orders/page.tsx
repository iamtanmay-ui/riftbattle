"use client";

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Package, Clock, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: number;
  product_id: number;
  name: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  warranty: number;
  date: number;
}

const mockOrders: Order[] = [
  {
    id: 1,
    product_id: 1,
    name: "Rare Fortnite Account",
    price: 99.99,
    status: "completed",
    warranty: 3,
    date: Date.now() - 86400000 // 1 day ago
  },
  {
    id: 2,
    product_id: 2,
    name: "OG Skin Bundle",
    price: 149.99,
    status: "pending",
    warranty: 6,
    date: Date.now() - 3600000 // 1 hour ago
  }
];

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

export default function OrdersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // TODO: Replace with actual API call
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => Promise.resolve(mockOrders),
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  const getStatusIcon = (status: Order['status']) => {
    const Icon = statusIcons[status];
    return <Icon className="h-4 w-4" />;
  };

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{order.name}</h3>
            <p className="text-gray-400">Order #{order.id}</p>
          </div>
          <Badge className={statusColors[order.status]}>
            <span className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-400">Price</p>
            <p className="text-white font-semibold">${order.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Warranty</p>
            <p className="text-white font-semibold">
              {order.warranty} {order.warranty === 1 ? 'Month' : 'Months'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Date</p>
            <p className="text-white font-semibold">
              {format(order.date, 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Time</p>
            <p className="text-white font-semibold">
              {format(order.date, 'h:mm a')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <Package className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/messages?order=${order.id}`)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Seller
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-8 text-gray-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-gray-400">View and manage your orders</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700/50">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {orders?.map(renderOrderCard)}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {orders?.filter(order => order.status === 'pending').map(renderOrderCard)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {orders?.filter(order => order.status === 'completed').map(renderOrderCard)}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {orders?.filter(order => order.status === 'cancelled').map(renderOrderCard)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}