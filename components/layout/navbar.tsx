"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GamepadIcon, Menu, X, User, Settings, ListOrdered, LogOut, Moon, Store } from "lucide-react";
import { LoginDialog } from "@/components/auth/login-dialog";
import { MiniCart } from "@/components/cart/mini-cart";
import { useAuthStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasSellerAccess = useAuthStore((state) => state.hasSellerAccess);

  const handleSellerDashboard = () => {
    console.log('Navbar - Seller Dashboard clicked');
    console.log('Current user:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      isAuthenticated: !!user
    });
    router.push('/seller');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="container mx-auto flex justify-between items-center px-6 py-4 bg-slate-900/80 backdrop-blur-md rounded-b-lg border-b border-slate-700/50">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <GamepadIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Rift Battle</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className={
                pathname === "/" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
            >
              Home
            </Link>
            <Link 
              href="/marketplace" 
              className={
                pathname === "/marketplace" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
            >
              Marketplace
            </Link>
            <Link 
              href="/faq" 
              className={
                pathname === "/faq" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              className={
                pathname === "/contact" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
            >
              Contact
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <MiniCart />
          <ThemeToggle />
          
          {hasSellerAccess() && (
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={handleSellerDashboard}
            >
              <Store className="mr-2 h-4 w-4" />
              Seller Dashboard
            </Button>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.seller_avatar || ""} alt={user.email} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.seller_name || user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {hasSellerAccess() && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller" onClick={() => {
                        console.log('Dropdown - Seller Dashboard clicked');
                        console.log('Current user:', {
                          id: user?.id,
                          email: user?.email,
                          role: user?.role,
                          isAuthenticated: !!user
                        });
                      }}>
                        <ListOrdered className="mr-2 h-4 w-4" />
                        <span>Seller Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    console.log('Logging out user:', user?.email);
                    useAuthStore.getState().setUser(null);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginDialog>
              <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                Login
              </Button>
            </LoginDialog>
          )}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>
      {isOpen && (
        <div className="container pb-4 md:hidden">
          <nav className="flex flex-col space-y-4 pt-4">
            <Link
              href="/"
              className={
                pathname === "/" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/marketplace"
              className={
                pathname === "/marketplace" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
              onClick={() => setIsOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              href="/faq"
              className={
                pathname === "/faq" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className={
                pathname === "/contact" ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
              }
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex space-x-4">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
