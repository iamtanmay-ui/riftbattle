"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, ListIcon, Settings, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, hasSellerAccess } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !hasSellerAccess()) {
      router.push('/');
    }
  }, [isAuthenticated, hasSellerAccess, router, user]);

  if (!isAuthenticated || !hasSellerAccess()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-6 px-4">
      {/* Navigation */}
      <div className="w-full max-w-screen-xl mx-auto">
        <div className="border-b border-slate-800 mb-6">
          <button 
            onClick={() => router.push('/marketplace')}
            className="flex items-center text-slate-400 hover:text-white transition-colors py-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="bg-transparent text-white hover:bg-slate-800 border-slate-700"
              onClick={() => router.push('/seller/payment-settings')}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Payment Settings
            </Button>
            <Button 
              className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white"
              onClick={() => router.push('/seller/create-listing')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Listing
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="w-full bg-slate-900/50 rounded-lg p-4 border border-slate-800">
            <div className="text-sm text-slate-400">Active Listings</div>
            <div className="text-2xl font-bold text-white mt-1">0</div>
          </div>
          <div className="w-full bg-slate-900/50 rounded-lg p-4 border border-slate-800">
            <div className="text-sm text-slate-400">Total Sales</div>
            <div className="text-2xl font-bold text-white mt-1">$0.00</div>
          </div>
          <div className="w-full bg-slate-900/50 rounded-lg p-4 border border-slate-800">
            <div className="text-sm text-slate-400">Pending Orders</div>
            <div className="text-2xl font-bold text-white mt-1">0</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="w-full bg-slate-900/50 rounded-lg border border-slate-800 p-6 mb-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className="bg-[#1A1B23] hover:bg-[#2A2B33] text-white border border-slate-800 cursor-pointer px-4 py-2 text-sm flex items-center transition-colors"
                onClick={() => router.push('/seller/listings')}
              >
                <ListIcon className="h-4 w-4 mr-2" />
                My Listings
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-[#1A1B23] hover:bg-[#2A2B33] text-white border border-slate-800 cursor-pointer px-4 py-2 text-sm flex items-center transition-colors"
                onClick={() => router.push('/seller/create-listing')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-[#1A1B23] hover:bg-[#2A2B33] text-white border border-slate-800 cursor-pointer px-4 py-2 text-sm flex items-center transition-colors"
                onClick={() => router.push('/seller/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Badge>
            </div>
          </div>
        </div>

        {/* View All Listings */}
        <Button 
          className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white py-6"
          onClick={() => router.push('/seller/listings')}
        >
          View All Listings
        </Button>
      </div>
    </div>
  );
}