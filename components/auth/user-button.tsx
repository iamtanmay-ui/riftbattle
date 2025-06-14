"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { userAtom } from "@/lib/atoms";
import { getUser } from "@/lib/api";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import { LoginDialog } from "./login-dialog";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export function UserButton() {
    const [user, setJotaiUser] = useAtom(userAtom);
    const setZustandUser = useAuthStore((state) => state.setUser);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUser();
                if (userData) {
                    setJotaiUser(userData);
                    setZustandUser(userData);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        // Only fetch user if we don't already have one in state
        if (!user) {
            fetchUser();
        }
    }, [setJotaiUser, setZustandUser, user]);

    const handleLogout = () => {
        // Update both state management systems
        setJotaiUser(null);
        setZustandUser(null);
        
        toast({
            title: "Logged out",
            description: "You have been successfully logged out",
        });
    };

    if (!user) {
        return <LoginDialog />;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    {user.seller_avatar ? (
                        <Image
                            src={user.seller_avatar}
                            alt={user.seller_name || user.email}
                            className="h-10 w-10 rounded-full object-cover"
                            width={40}
                            height={40}
                        />
                    ) : (
                        <User className="h-5 w-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.seller_name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
