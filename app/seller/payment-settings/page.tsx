"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, InfoIcon, Save } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';

export default function PaymentSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // State for payment settings
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [paypalId, setPaypalId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [nowpaymentsApiKey, setNowpaymentsApiKey] = useState('');
  const [nowpaymentsIpn, setNowpaymentsIpn] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not a seller
  if (!isAuthenticated || !user || !user.isSellerAllowed) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/seller/edit_payment_info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_token: telegramBotToken,
          paypal_id: paypalId,
          paypal_secret: paypalSecret,
          nowpayments_apikey: nowpaymentsApiKey,
          nowpayments_ipn: nowpaymentsIpn,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment settings');
      }
      
      toast({
        title: 'Settings updated',
        description: 'Your payment settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast({
        title: 'Error updating settings',
        description: error instanceof Error ? error.message : 'Please try again or contact support',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <PageLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-4"
              onClick={() => router.push('/seller')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Payment Settings</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Configure Payment Methods</CardTitle>
              <CardDescription>
                Set up the payment methods you want to accept in your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Telegram Stars */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Telegram Stars</h3>
                  <div>
                    <Label htmlFor="telegramBotToken">Bot Token</Label>
                    <div className="flex mt-1.5">
                      <Input
                        id="telegramBotToken"
                        type="password"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        className="flex-1"
                        placeholder="Enter your Telegram bot token"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                      <InfoIcon className="h-3 w-3 mr-1" />
                      Get this from BotFather on Telegram
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* PayPal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">PayPal</h3>
                  <div>
                    <Label htmlFor="paypalId">Client ID</Label>
                    <Input
                      id="paypalId"
                      value={paypalId}
                      onChange={(e) => setPaypalId(e.target.value)}
                      className="mt-1.5"
                      placeholder="Enter your PayPal client ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paypalSecret">Client Secret</Label>
                    <Input
                      id="paypalSecret"
                      type="password"
                      value={paypalSecret}
                      onChange={(e) => setPaypalSecret(e.target.value)}
                      className="mt-1.5"
                      placeholder="Enter your PayPal client secret"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <InfoIcon className="h-3 w-3 mr-1" />
                    Get these from the PayPal Developer Dashboard
                  </p>
                </div>
                
                <Separator />
                
                {/* NOWPayments (Crypto) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">NOWPayments (Cryptocurrency)</h3>
                  <div>
                    <Label htmlFor="nowpaymentsApiKey">API Key</Label>
                    <Input
                      id="nowpaymentsApiKey"
                      value={nowpaymentsApiKey}
                      onChange={(e) => setNowpaymentsApiKey(e.target.value)}
                      className="mt-1.5"
                      placeholder="Enter your NOWPayments API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nowpaymentsIpn">IPN Secret Key</Label>
                    <Input
                      id="nowpaymentsIpn"
                      type="password"
                      value={nowpaymentsIpn}
                      onChange={(e) => setNowpaymentsIpn(e.target.value)}
                      className="mt-1.5"
                      placeholder="Enter your NOWPayments IPN secret key"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <InfoIcon className="h-3 w-3 mr-1" />
                    Get these from your NOWPayments merchant dashboard
                  </p>
                </div>
                
                <div className="flex items-center pt-4">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  <p className="text-sm text-muted-foreground">
                    Your payment credentials are securely stored and never shared with customers.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Payment Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
} 