"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Moon, Sun, Menu, X, Store } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { useAuthStore, useCartStore } from '@/lib/store';


const isApprovedSeller = (userEmail: string | null, isAuthenticated: boolean) => {
  if (!isAuthenticated || !userEmail) return false;
  
  const approvedEmails = process.env.NEXT_PUBLIC_APPROVED_SELLER_EMAILS?.split(',') || [];
  
  return approvedEmails.some(email => email.trim().toLowerCase() === userEmail.toLowerCase());
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.email || null;
  const isAuthorizedSeller = isApprovedSeller(userEmail, isAuthenticated);
  const cartCount = useCartStore((state) => state.items.length);
  
  const showSellerOptions = isAuthenticated && isAuthorizedSeller;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const routes = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-950 py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center">
            <span className="text-xl font-bold text-purple-500">
              <span className="text-blue-500">Rift</span> Battle
            </span>
          </Link>

          <div className="hidden space-x-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-sm ${
                  pathname === route.path ? 'text-purple-500' : 'text-white/80 hover:text-white'
                }`}
              >
                {route.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 text-white/80 hover:text-white" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <ModeToggle />

          <div className="hidden md:flex space-x-3">
            {/* Only show Login button when not authenticated */}
            {!isAuthenticated && (
              <Link href="/login">
                <Button className="h-9 bg-purple-600 hover:bg-purple-700 text-white">
                  Login
                </Button>
              </Link>
            )}
          </div>

          <button
            className="flex items-center justify-center md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 pt-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-4">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`py-2 text-lg ${
                    pathname === route.path ? 'text-purple-500' : 'text-white/80'
                  }`}
                  onClick={toggleMenu}
                >
                  {route.name}
                </Link>
              ))}
              <div className="border-t border-slate-800 pt-4">
                {/* Only show Login button when not authenticated */}
                {!isAuthenticated && (
                  <Link href="/login" onClick={toggleMenu}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 