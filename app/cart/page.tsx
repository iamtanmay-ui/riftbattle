"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { checkCoupon } from '@/lib/api';
import { ShoppingCart, Trash2, ChevronLeft, Shield, Tag, CreditCard, Heart, Plus, Minus, BookmarkIcon, MoveIcon } from 'lucide-react';
import { LoginDialog } from '@/components/auth/login-dialog';
import { useAuthStore } from '@/lib/store';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    items, 
    savedItems,
    removeItem, 
    updateWarranty, 
    clearCart, 
    updateQuantity,
    saveForLater,
    moveToCart,
    removeSavedItem,
    getCartTotal
  } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const subtotal = getCartTotal();
  const total = subtotal * (1 - discount / 100);

  const handleWarrantyChange = (itemId: number, warranty: number) => {
    updateWarranty(itemId, warranty);
  };

  const handleRemoveItem = (itemId: number) => {
    removeItem(itemId);
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your cart',
    });
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleSaveForLater = (itemId: number) => {
    saveForLater(itemId);
    toast({
      title: 'Item saved',
      description: 'The item has been saved for later',
    });
  };

  const handleMoveToCart = (itemId: number) => {
    moveToCart(itemId);
    toast({
      title: 'Item moved to cart',
      description: 'The item has been moved to your cart',
    });
  };

  const handleRemoveSavedItem = (itemId: number) => {
    removeSavedItem(itemId);
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your saved items',
    });
  };

  const handleCheckCoupon = async () => {
    if (!couponCode) return;

    try {
      setIsCheckingCoupon(true);
      const response = await checkCoupon(couponCode);
      setDiscount(response.discount);
      toast({
        title: 'Coupon applied',
        description: `${response.discount}% discount has been applied`,
      });
    } catch (error) {
      toast({
        title: 'Invalid coupon',
        description: 'The coupon code is invalid or expired',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to continue with checkout',
      });
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Browse our marketplace to find rare Fortnite accounts</p>
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Browse Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-8 text-gray-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Shopping
        </Button>

        <Tabs defaultValue="cart" className="w-full">
          <TabsList className="mb-6 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="cart" className="data-[state=active]:bg-blue-600">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({items.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-blue-600">
              <BookmarkIcon className="h-4 w-4 mr-2" />
              Saved Items ({savedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart">
            {items.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
                <p className="text-gray-400 mb-6">Add items to your cart or check your saved items</p>
                <Button
                  onClick={() => router.push('/marketplace')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                  {items.map((item) => (
                    <Card key={item.id} className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Item Image (placeholder) */}
                          <div className="w-full md:w-24 h-24 bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                width={96} 
                                height={96} 
                                className="object-cover"
                              />
                            ) : (
                              <ShoppingCart className="h-8 w-8 text-slate-500" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                <p className="text-gray-400">${item.price}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-blue-500"
                                  onClick={() => handleSaveForLater(item.id)}
                                  title="Save for later"
                                >
                                  <BookmarkIcon className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-red-500"
                                  onClick={() => handleRemoveItem(item.id)}
                                  title="Remove item"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                  Warranty Period
                                </label>
                                <Select
                                  value={item.warranty?.toString() || "0"}
                                  onValueChange={(value) => handleWarrantyChange(item.id, parseInt(value, 10))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select warranty" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">No Warranty</SelectItem>
                                    <SelectItem value="3">3 Months (+$10)</SelectItem>
                                    <SelectItem value="6">6 Months (+$20)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                  Quantity
                                </label>
                                <div className="flex items-center">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-r-none"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)}
                                    min="1"
                                    className="h-10 rounded-none text-center w-16"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-l-none"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <Card className="bg-slate-800/50 border-slate-700/50 sticky top-4">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Discount ({discount}%)</span>
                          <span className="text-green-500">-${(subtotal * (discount / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-400">Total</span>
                        <span className="text-white">${total.toFixed(2)}</span>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={handleCheckCoupon}
                          disabled={isCheckingCoupon || !couponCode}
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      {isAuthenticated ? (
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={handleCheckout}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Checkout
                        </Button>
                      ) : (
                        <LoginDialog>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Login to Checkout
                          </Button>
                        </LoginDialog>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/marketplace')}
                      >
                        Continue Shopping
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {savedItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No saved items</h3>
                <p className="text-gray-400 mb-6">Items you save for later will appear here</p>
                <Button
                  onClick={() => router.push('/marketplace')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map((item) => (
                  <Card key={item.id} className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        {/* Item Image (placeholder) */}
                        <div className="w-full h-40 bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <Image 
                              src={item.image} 
                              alt={item.name} 
                              width={160} 
                              height={160} 
                              className="object-cover"
                            />
                          ) : (
                            <ShoppingCart className="h-12 w-12 text-slate-500" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                          <p className="text-gray-400 mb-4">${item.price}</p>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleMoveToCart(item.id)}
                            >
                              <MoveIcon className="h-4 w-4 mr-2" />
                              Move to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => handleRemoveSavedItem(item.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}