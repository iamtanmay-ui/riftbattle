"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrandTelegram, CreditCard, Loader } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';

export default function MockTelegramPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  
  // Get the redirect URL from the query parameters
  const redirectUrl = searchParams.get('redirect') || '/payment/success';
  
  // Simulate payment processing with a countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to success page after countdown
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [redirectUrl]);
  
  // Handle manual "Complete Payment" button click
  const handleCompletePayment = () => {
    window.location.href = redirectUrl;
  };
  
  return (
    <PageLayout>
      <div className="py-8">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                <BrandTelegram className="h-10 w-10 text-[#0088cc]" />
              </div>
              <CardTitle className="text-xl">Telegram Stars Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="font-medium">Simulating payment processing...</p>
                <div className="flex items-center justify-center mt-4 mb-2">
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  <span>Processing payment</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirecting in {countdown} seconds...
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  This is a simulated payment page for testing purposes.
                </p>
                <p className="text-sm text-muted-foreground">
                  In a real application, you would be redirected to the Telegram payment interface.
                </p>
              </div>
              
              <Button 
                onClick={handleCompletePayment}
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Payment Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
} 