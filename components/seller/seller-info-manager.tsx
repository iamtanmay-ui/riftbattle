'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function SellerInfoManager() {
  const [sellerName, setSellerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sellerName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a seller name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/seller/edit-seller-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seller_name: sellerName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update seller information');
      }

      toast({
        title: 'Success',
        description: 'Seller information updated successfully!',
      });
      setSellerName('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update seller information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sellerName" className="block text-sm font-medium mb-2">
          Seller Name
        </label>
        <Input
          id="sellerName"
          placeholder="Enter your seller name"
          value={sellerName}
          onChange={(e) => setSellerName(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !sellerName.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Update Seller Information'
        )}
      </Button>
    </form>
  );
} 