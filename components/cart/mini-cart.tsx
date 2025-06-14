"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2, ChevronRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export function MiniCart() {
  const router = useRouter();
  const { items, removeItem, getCartCount, getCartTotal } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  const handleRemoveItem = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    removeItem(itemId);
  };

  const handleViewCart = () => {
    setIsOpen(false);
    router.push('/cart');
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  if (cartCount === 0) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => router.push('/cart')}
      >
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600"
          >
            {cartCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-slate-800 border-slate-700"
        align="end"
        sideOffset={8}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <h3 className="font-semibold text-white">Your Cart ({cartCount})</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {items.length > 0 ? (
          <>
            <ScrollArea className="max-h-[300px]">
              <div className="p-2">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-md cursor-pointer"
                    onClick={handleViewCart}
                  >
                    <div className="w-12 h-12 bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={48} 
                          height={48} 
                          className="object-cover"
                        />
                      ) : (
                        <ShoppingCart className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span>${item.price} × {item.quantity}</span>
                        {item.warranty && item.warranty > 0 && (
                          <span className="ml-2">
                            (+{item.warranty}m warranty)
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={(e) => handleRemoveItem(e, item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-700">
              <div className="flex justify-between mb-4">
                <span className="text-gray-400">Total</span>
                <span className="font-semibold text-white">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewCart}
                >
                  View Cart
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Your cart is empty</p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                setIsOpen(false);
                router.push('/marketplace');
              }}
            >
              Browse Marketplace
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
