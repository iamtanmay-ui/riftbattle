"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Shield, 
  CreditCard, 
  Lock, 
  User, 
  MessageSquare, 
  Tag, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { LoginDialog } from '@/components/auth/login-dialog';
import Link from 'next/link';

// Extended cart item with seller information
interface ExtendedCartItem {
  id: number;
  name: string;
  price: number;
  warranty?: number;
  quantity: number;
  image?: string;
  seller?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'account'>('guest');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [email, setEmail] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [allItemsAvailable, setAllItemsAvailable] = useState(true);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'telegram_stars' | 'paypal' | 'nowpayments'>('paypal');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');

  const subtotal = items.reduce((total, item) => {
    const warrantyPrice = item.warranty === 3 ? 10 : item.warranty === 6 ? 20 : 0;
    return total + item.price + warrantyPrice;
  }, 0);

  const discount = couponApplied ? couponDiscount : 0;
  const total = Math.max(0, subtotal - discount);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Generate a unique order ID
  useEffect(() => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    setOrderId(`RB-${timestamp}-${randomStr}`.toUpperCase());
  }, []);

  // Check item availability
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        // Simulated API call to check availability
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, let's assume all items are available
        // In a real implementation, this would check with the backend
        const unavailable: string[] = [];
        
        // For demonstration, let's mark a random item as unavailable if there are multiple items
        if (items.length > 1 && Math.random() > 0.7) {
          const randomIndex = Math.floor(Math.random() * items.length);
          unavailable.push(items[randomIndex].name);
        }
        
        setUnavailableItems(unavailable);
        setAllItemsAvailable(unavailable.length === 0);
        setAvailabilityChecked(true);
      } catch (error) {
        toast({
          title: 'Error checking availability',
          description: 'Please try again or contact support',
          variant: 'destructive',
        });
      }
    };

    if (items.length > 0 && !availabilityChecked) {
      checkAvailability();
    }
  }, [items, availabilityChecked, toast]);

  // Check for payment return status on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const returnOrderId = urlParams.get('order_id');
    
    if (paymentStatus === 'success' && returnOrderId) {
      setIsPaymentComplete(true);
      setCompletedOrderId(returnOrderId);
      clearCart();
    }
  }, []);

  const applyCoupon = () => {
    // Simulated coupon validation
    if (couponCode.toUpperCase() === 'WELCOME10') {
      const discountAmount = subtotal * 0.1; // 10% discount
      setCouponDiscount(discountAmount);
      setCouponApplied(true);
      toast({
        title: 'Coupon applied',
        description: `You saved $${discountAmount.toFixed(2)}!`,
      });
    } else if (couponCode.toUpperCase() === 'RIFT20') {
      const discountAmount = subtotal * 0.2; // 20% discount
      setCouponDiscount(discountAmount);
      setCouponApplied(true);
      toast({
        title: 'Coupon applied',
        description: `You saved $${discountAmount.toFixed(2)}!`,
      });
    } else {
      toast({
        title: 'Invalid coupon',
        description: 'Please check your coupon code and try again',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!items.length) {
        throw new Error("No items in cart");
      }

      // Validate email
      if (!email && !user?.email) {
        throw new Error("Email is required for checkout");
      }

      // In a real app, we'd handle multiple items
      // For now, let's assume just the first item in the cart
      const item = items[0];

      // Create the order using our API
      const response = await fetch('/api/create_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || user?.email,
          product_id: item.id,
          payment_method: paymentMethod,
          coupon: couponApplied ? couponCode : undefined,
          warranty: item.warranty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      
      // Store the order ID for reference
      if (data.order_id) {
        localStorage.setItem('pendingOrderId', data.order_id);
      }
      
      // If guest checkout with account creation
      if (createAccount) {
        // Create account logic would go here
        // For now, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully!',
        });
      }

      // Clear the cart
      clearCart();
      
      // Redirect to the payment URL
      if (data.payment_url) {
        toast({
          title: 'Redirecting to payment',
          description: `You're being redirected to complete your payment...`,
        });
        
        // Small delay to show the toast before redirecting
        setTimeout(() => {
          window.location.href = data.payment_url;
        }, 1500);
      } else {
        // Fallback to order confirmation if no payment URL
        router.push(`/orders/${orderId.toLowerCase()}`);
        
        toast({
          title: 'Order placed successfully',
          description: `Your order #${orderId} has been placed!`,
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error processing payment',
        description: error instanceof Error ? error.message : 'Please try again or contact support',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openSellerChat = (sellerId: string) => {
    // In a real app, this would open a chat with the seller
    router.push(`/messages?seller=${sellerId}`);
  };

  if (items.length === 0) {
    return null; // Handled by the useEffect redirect
  }

  // Render payment success page if returning from payment
  if (isPaymentComplete) {
    return (
      <PageLayout>
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-500">
                  <CheckCircle2 className="h-6 w-6 mr-2" />
                  Payment Successful
                </CardTitle>
                <CardDescription>
                  Your order #{completedOrderId} has been successfully processed
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="mb-6">Thank you for your purchase! Your order has been confirmed.</p>
                <p className="mb-6">A confirmation email has been sent to your email address.</p>
                <Button onClick={() => router.push('/marketplace')}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-8 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>

          {!availabilityChecked ? (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p>Checking item availability...</p>
                </div>
              </CardContent>
            </Card>
          ) : !allItemsAvailable ? (
            <Card className="mb-8 border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Some items are unavailable
                </CardTitle>
                <CardDescription>
                  The following items are currently unavailable:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {unavailableItems.map((item, index) => (
                    <li key={index} className="text-destructive">{item}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/cart')}
                  className="w-full"
                >
                  Return to cart to update your items
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-8 border-green-500/50">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-500">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <p>All items are available for purchase</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Checkout</CardTitle>
                  <CardDescription>
                    Order ID: {orderId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={checkoutMode} onValueChange={(value) => setCheckoutMode(value as 'guest' | 'account')}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="guest" disabled={isProcessing}>Guest Checkout</TabsTrigger>
                      <TabsTrigger value="account" disabled={isProcessing}>
                        Sign In to Checkout
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="guest">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Email Address
                            </label>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="create-account" 
                              checked={createAccount}
                              onCheckedChange={(checked) => setCreateAccount(checked === true)}
                            />
                            <Label htmlFor="create-account">Create an account for faster checkout next time</Label>
                          </div>
                          
                          {createAccount && (
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Password
                              </label>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                required={createAccount}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                            </div>
                          )}
                          
                          <Separator className="my-4" />
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Payment Method
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="paypal"
                                  value="paypal"
                                  checked={paymentMethod === 'paypal'}
                                  onChange={() => setPaymentMethod('paypal')}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="paypal">PayPal</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="telegram"
                                  value="telegram_stars"
                                  checked={paymentMethod === 'telegram_stars'}
                                  onChange={() => setPaymentMethod('telegram_stars')}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="telegram">Telegram Stars</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="crypto"
                                  value="nowpayments"
                                  checked={paymentMethod === 'nowpayments'}
                                  onChange={() => setPaymentMethod('nowpayments')}
                                  className="h-4 w-4"
                                />
                                <label htmlFor="crypto">Cryptocurrency (via NOWPayments)</label>
                              </div>
                            </div>
                          </div>
                          
                          {paymentMethod === 'paypal' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Card Number
                                </label>
                                <Input
                                  placeholder="1234 5678 9012 3456"
                                  maxLength={19}
                                  className="font-mono"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Expiry Date
                                  </label>
                                  <Input
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    className="font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    CVC
                                  </label>
                                  <Input
                                    placeholder="123"
                                    maxLength={4}
                                    className="font-mono"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isProcessing || !allItemsAvailable}
                        >
                          {isProcessing ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              {paymentMethod === 'paypal' ? `Pay $${total.toFixed(2)}` : 
                               paymentMethod === 'telegram_stars' ? 'Pay with Telegram Stars' : 
                               'Pay with Cryptocurrency'}
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="account">
                      <div className="text-center py-8">
                        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Sign in to your account</h3>
                        <p className="text-muted-foreground mb-6">
                          Sign in to access your saved payment methods and checkout faster
                        </p>
                        <LoginDialog />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Seller: {(item as ExtendedCartItem).seller || 'Unknown'}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-auto p-0 text-primary"
                          onClick={() => openSellerChat(item.id.toString())}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                      {item.warranty !== undefined && item.warranty > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Warranty ({item.warranty} months)</span>
                          <span>${item.warranty === 3 ? '10.00' : '20.00'}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                    </div>
                  ))}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Coupon Code Input */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Coupon Code
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied || isProcessing}
                      />
                      <Button 
                        variant="outline" 
                        onClick={applyCoupon}
                        disabled={!couponCode || couponApplied || isProcessing}
                      >
                        Apply
                      </Button>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between mt-2 text-green-500 text-sm">
                        <span>Discount</span>
                        <span>-${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                    <Shield className="h-4 w-4" />
                    <span>Secure Payment</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}