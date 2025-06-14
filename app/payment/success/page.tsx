"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { useCartStore } from '@/lib/store';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    paymentMethod: '',
    email: ''
  });

  useEffect(() => {
    // Clear the cart when payment is successful
    clearCart();
    
    // Get order details from URL parameters
    const orderId = searchParams.get('order_id') || localStorage.getItem('pendingOrderId') || 'Unknown';
    const paymentMethod = searchParams.get('payment_method') || 'Unknown';
    const email = searchParams.get('email') || 'your email';
    
    setOrderDetails({
      orderId,
      paymentMethod,
      email
    });
    
    // Clear the pending order ID from localStorage
    localStorage.removeItem('pendingOrderId');
    
    // You could also call an API here to verify payment status or get order details
  }, [clearCart, searchParams]);

  return (
    <PageLayout>
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-green-500/50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Payment Successful</CardTitle>
              <CardDescription className="text-lg">
                Your order has been confirmed!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Order Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Order ID:</span> {orderDetails.orderId}</p>
                  <p><span className="text-muted-foreground">Payment Method:</span> {orderDetails.paymentMethod}</p>
                  <p><span className="text-muted-foreground">Confirmation Email:</span> Sent to {orderDetails.email}</p>
                </div>
              </div>
              
              <div className="text-center text-muted-foreground">
                <p>A confirmation email has been sent with your order details.</p>
                <p>You can track your order from your account page.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => router.push('/orders')}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  View My Orders
                </Button>
                <Button 
                  onClick={() => router.push('/marketplace')}
                  className="w-full sm:w-auto"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
} 