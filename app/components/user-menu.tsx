"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LogOut, Settings, ShoppingBag, Store } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface UserMenuProps {
    user: {
        username: string;
        role: string;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { setUser, setIsAuthenticated, setIsAdmin, setIsSeller, hasSellerAccess } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            console.log('Logging out user:', user.username);
            // Clear both session and auth_token cookies
            document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            // Reset auth state
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsSeller(false);
            
            // Close the menu
            setIsOpen(false);
            
            // Redirect to home page
            router.push('/');
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const handleSellerDashboard = () => {
        console.log('Accessing seller dashboard with role:', user.role);
        setIsOpen(false);
        router.push('/seller');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
                <User className="h-5 w-5" />
                <span>{user.username}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                    >
                        <Settings className="h-4 w-4" />
                        Profile
                    </Link>
                    <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Orders
                    </Link>
                    {hasSellerAccess() && (
                        <button
                            onClick={handleSellerDashboard}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <Store className="h-4 w-4" />
                            Seller Dashboard
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
} 