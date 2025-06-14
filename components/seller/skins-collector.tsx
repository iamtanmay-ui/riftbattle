'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SkinsData {
  athena_ids: string[];
  skins_count: number;
  emotes_count: number;
  backpacks_count: number;
  pickaxes_count: number;
  glider_count: number;
  vbucks_count: number;
  account_level: number;
  suggested_name: string;
}

export function SkinsCollector() {
  const [isLoading, setIsLoading] = useState(false);
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string | null>(null);
  const [skinsData, setSkinsData] = useState<SkinsData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getAuthLink = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/seller/get-link');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authentication link');
      }

      setDeviceCode(data.device_code);
      setVerificationUri(data.verification_uri_complete);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get authentication link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSkins = async () => {
    if (!deviceCode) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/seller/get_skins?device_code=${deviceCode}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Please log in again to continue.',
            variant: 'destructive',
          });
          return;
        }
        
        if (data.error === 'link expired') {
          toast({
            title: 'Link Expired',
            description: 'The authentication link has expired. Please try again.',
            variant: 'destructive',
          });
          setDeviceCode(null);
          setVerificationUri(null);
          setIsDialogOpen(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to get skins information');
      }

      const data = await response.json();
      console.log('Received skins data:', data);

      if (!data.athena_ids) {
        throw new Error('Invalid response format: missing athena_ids');
      }

      setSkinsData(data);
      toast({
        title: 'Success',
        description: `Found ${data.skins_count} skins and other items!`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error fetching skins:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get skins information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deviceCode) {
      const interval = setInterval(checkSkins, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [deviceCode]);

  return (
    <div className="space-y-4">
      <Button
        onClick={getAuthLink}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Collect Skins Information
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Epic Games Authentication</DialogTitle>
            <DialogDescription>
              Please complete the authentication process to collect your skins information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to open Epic Games authentication page:
            </p>
            <Button
              onClick={() => window.open(verificationUri || '', '_blank')}
              className="w-full"
            >
              Open Epic Games Authentication
            </Button>
            <p className="text-sm text-muted-foreground">
              After completing the authentication, the skins information will be automatically collected.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {skinsData && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Skins Count</p>
              <p className="text-lg font-medium">{skinsData.skins_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emotes Count</p>
              <p className="text-lg font-medium">{skinsData.emotes_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Backpacks Count</p>
              <p className="text-lg font-medium">{skinsData.backpacks_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pickaxes Count</p>
              <p className="text-lg font-medium">{skinsData.pickaxes_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gliders Count</p>
              <p className="text-lg font-medium">{skinsData.glider_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">V-Bucks</p>
              <p className="text-lg font-medium">{skinsData.vbucks_count}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Account Level</p>
            <p className="text-lg font-medium">{skinsData.account_level}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Suggested Name</p>
            <p className="text-lg font-medium">{skinsData.suggested_name}</p>
          </div>
        </div>
      )}
    </div>
  );
} 