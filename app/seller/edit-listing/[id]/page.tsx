"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { useAuthStore } from "@/lib/store";

interface EpicGamesAccount {
  id: string;
  displayName: string;
  email: string;
  cosmetics: {
    skins: Array<{ id: string; name: string; image: string }>;
    backblings: Array<{ id: string; name: string; image: string }>;
    emotes: Array<{ id: string; name: string; image: string }>;
    pickaxes: Array<{ id: string; name: string; image: string }>;
    gliders: Array<{ id: string; name: string; image: string }>;
  };
  cosmeticCounts: {
    skins: number;
    backblings: number;
    emotes: number;
    pickaxes: number;
    gliders: number;
  };
}

const TEST_EPIC_ACCOUNT: EpicGamesAccount = {
  id: 'test-epic-id',
  displayName: 'TestFortnitePlayer',
  email: 'test@epicgames.com',
  cosmetics: {
    skins: [
      { id: 'skin1', name: 'Renegade Raider', image: 'https://fortnite-api.com/images/cosmetics/br/cid_028_athena_commando_f/icon.png' },
      { id: 'skin2', name: 'Black Knight', image: 'https://fortnite-api.com/images/cosmetics/br/cid_035_athena_commando_m_medieval/icon.png' },
      { id: 'skin3', name: 'Skull Trooper', image: 'https://fortnite-api.com/images/cosmetics/br/cid_030_athena_commando_m_halloween/icon.png' },
    ],
    backblings: [
      { id: 'bb1', name: 'Black Shield', image: 'https://fortnite-api.com/images/cosmetics/br/bid_004_blackknight/icon.png' },
      { id: 'bb2', name: 'Ghost Portal', image: 'https://fortnite-api.com/images/cosmetics/br/bid_316_ghostportal/icon.png' },
    ],
    emotes: [
      { id: 'emote1', name: 'Floss', image: 'https://fortnite-api.com/images/cosmetics/br/eid_floss/icon.png' },
      { id: 'emote2', name: 'The Worm', image: 'https://fortnite-api.com/images/cosmetics/br/eid_worm/icon.png' },
    ],
    pickaxes: [
      { id: 'pick1', name: 'AC/DC', image: 'https://fortnite-api.com/images/cosmetics/br/pickaxe_lockjaw/icon.png' },
      { id: 'pick2', name: 'Raiders Revenge', image: 'https://fortnite-api.com/images/cosmetics/br/pickaxe_raiders_revenge/icon.png' },
    ],
    gliders: [
      { id: 'glider1', name: 'Mako', image: 'https://fortnite-api.com/images/cosmetics/br/glider_mako/icon.png' },
      { id: 'glider2', name: 'Aerial Assault One', image: 'https://fortnite-api.com/images/cosmetics/br/glider_aerial_assault_one/icon.png' },
    ],
  },
  cosmeticCounts: {
    skins: 3,
    backblings: 2,
    emotes: 2,
    pickaxes: 2,
    gliders: 2,
  },
};

interface Listing {
  id: string;
  title: string;
  accountType: string;
  platform: string;
  description: string;
  loginInfo: string;
  price: string;
  status: 'active' | 'paused' | 'sold';
  epicAccount?: {
    id: string;
    displayName: string;
    cosmeticCounts: {
      skins: number;
      backblings: number;
      emotes: number;
      pickaxes: number;
      gliders: number;
    };
  };
}

// Add the default description constant
const DEFAULT_DESCRIPTION = `✅ Instant Delivery ✅
Full Access to the Account's Email!
14 Days Insurance!
• Best Value For Price In the Whole Market!
Check the Account's Screenshots for More Information!

Platform Information: PC/PSN/XBOX/NINTENDO

Important Store Rules:
• Link to console is not guaranteed unless stated otherwise, we will not be responsible if your platform is not supported!
• Selling accounts is against Epic Games' terms of service, contacting them via email will result to account ban, which will not be covered by us
• We will NOT offer any refunds in case you do not want or like the account. Check everything before making a purchase.
• You will not be able to change the account's email instantly unless stated otherwise (title includes 'Email Changeable').

It may take up-to 3 months to change the email but do not worry!
During this period you are provided with full email access making the account completely yours!
• After purchasing the account make sure to change all of the information (email password & epic games password) because if anything happens, we must be provided with email access by the buyer!`;

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [epicAccount, setEpicAccount] = useState<EpicGamesAccount | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const { user } = useAuthStore();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    accountType: '',
    platform: '',
    description: '',
    loginInfo: '',
    price: '',
  });
  
  // Add a state for using default description
  const [useDefaultDescription, setUseDefaultDescription] = useState(true);
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to edit listings',
        variant: 'destructive',
      });
      router.push('/seller/login');
      return;
    }

    // Fetch listing data
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For this demo, we'll simulate it based on our test data
        if (params.id === '1') {
          // Simulate the API response
          const response = await new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                id: '1',
                title: 'OG Fortnite Account with Rare Skins',
                accountType: 'og',
                platform: 'pc',
                description: DEFAULT_DESCRIPTION,
                loginInfo: 'Login details would be here in a real account',
                price: '120.00',
                status: 'active',
                epicAccount: {
                  id: 'test-epic-id',
                  displayName: 'TestFortnitePlayer',
                  cosmeticCounts: {
                    skins: 3,
                    backblings: 2,
                    emotes: 2,
                    pickaxes: 2,
                    gliders: 2,
                  }
                }
              });
            }, 1000);
          });

          if (!response) {
            throw new Error('No response received from server');
          }

          const listingData = response as Listing;
          
          setListing(listingData);
          setFormData({
            title: listingData.title,
            accountType: listingData.accountType,
            platform: listingData.platform,
            description: listingData.description,
            loginInfo: listingData.loginInfo,
            price: listingData.price,
          });
          
          // Check if the description is the default one
          const isDefaultDesc = listingData.description === DEFAULT_DESCRIPTION;
          setUseDefaultDescription(isDefaultDesc);
          if (!isDefaultDesc) {
            setCustomDescription(listingData.description);
          }
          
          // Also set the Epic account
          setEpicAccount(TEST_EPIC_ACCOUNT);
          
          setIsLoading(false);
        } else {
          throw new Error('Listing not found');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load listing. Please try again.',
          variant: 'destructive',
        });
        router.push('/seller/dashboard');
      }
    };
    
    fetchListing();
  }, [params.id, router, toast, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is still authenticated
    if (!user) {
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue',
        variant: 'destructive',
      });
      router.push('/seller/login');
      return;
    }

    if (!epicAccount || !listing) {
      toast({
        title: 'Error',
        description: 'Cannot update listing - missing data',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Prepare the submission data with the correct format
      const submissionData = {
        name: formData.title.trim() || listing.title,
        price: parseFloat(formData.price),
        athena_ids: epicAccount.cosmetics.skins.map((skin: any) => skin.id),
        stats: {
          level: epicAccount.cosmeticCounts.skins?.toString() || "1",
          backpacks: epicAccount.cosmeticCounts.backblings?.toString() || "0"
        },
        active: true,
        description: useDefaultDescription ? DEFAULT_DESCRIPTION : customDescription,
        credentials: formData.loginInfo.trim(),
        discount: 0
      };

      // Make the API call to update the product
      const response = await fetch(`/api/seller/edit_product/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      console.log('Updated product:', updatedProduct);

      toast({
        title: 'Success',
        description: 'Your listing has been updated successfully!',
      });
      
      // Redirect to the seller listings page
      router.push('/seller/listings');
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCosmeticSection = (title: string, items: Array<{ id: string; name: string; image: string }>) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <img
              src={item.image}
              alt={item.name}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm text-center px-2">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleBack = () => {
    router.push('/seller/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-300">Loading listing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12">
      <div className="w-full max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <Card className="bg-slate-800/50 border-slate-700/50 shadow-xl shadow-blue-900/10">
          <CardHeader className="text-center border-b border-slate-700/50 pb-6">
            <CardTitle className="text-2xl font-bold text-white">Edit Listing</CardTitle>
            <CardDescription className="text-slate-300 mt-2">
              Update your listing information
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {epicAccount && (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Epic Account Info - Improved styling */}
                <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-700/50 shadow-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">Connected Account</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-slate-400 block mb-1">Display Name:</span>
                      <span className="text-white font-medium text-lg">{epicAccount.displayName}</span>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-slate-400 block mb-1">Email:</span>
                      <span className="text-white font-medium text-lg">{epicAccount.email}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {Object.entries(epicAccount.cosmeticCounts).map(([type, count]) => (
                      <div key={type} className="text-center bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
                        <div className="text-2xl font-bold text-white">{count}</div>
                        <div className="text-xs text-blue-300 capitalize">{type}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cosmetics Display */}
                <div className="space-y-8">
                  {renderCosmeticSection('Skins', epicAccount.cosmetics.skins)}
                  {renderCosmeticSection('Back Blings', epicAccount.cosmetics.backblings)}
                  {renderCosmeticSection('Emotes', epicAccount.cosmetics.emotes)}
                  {renderCosmeticSection('Pickaxes', epicAccount.cosmetics.pickaxes)}
                  {renderCosmeticSection('Gliders', epicAccount.cosmetics.gliders)}
                </div>

                {/* Manual Input Fields */}
                <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-700/50 shadow-lg">
                  <h3 className="text-xl font-semibold text-white mb-6">Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title" className="text-slate-300">Listing Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter a title for your listing"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountType" className="text-slate-300">Account Type</Label>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                      >
                        <SelectTrigger id="accountType" className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="standard">Standard Account</SelectItem>
                          <SelectItem value="og">OG Account</SelectItem>
                          <SelectItem value="stacked">Stacked Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-slate-300">Device/Platform</Label>
                      <Select
                        value={formData.platform}
                        onValueChange={(value) => setFormData({ ...formData, platform: value })}
                      >
                        <SelectTrigger id="platform" className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pc">PC</SelectItem>
                          <SelectItem value="ps4">PlayStation</SelectItem>
                          <SelectItem value="xbox">Xbox</SelectItem>
                          <SelectItem value="switch">Nintendo Switch</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="description" className="text-slate-300">Description</Label>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="useDefault" className="text-slate-400 text-sm cursor-pointer">
                            Use default template
                          </Label>
                          <input
                            id="useDefault"
                            type="checkbox"
                            checked={useDefaultDescription}
                            onChange={(e) => setUseDefaultDescription(e.target.checked)}
                            className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {useDefaultDescription ? (
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-4">
                          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-slate-300 text-sm">
                            {DEFAULT_DESCRIPTION}
                          </div>
                          <p className="mt-2 text-xs text-slate-500">Using default description template</p>
                        </div>
                      ) : (
                        <Textarea
                          id="description"
                          placeholder="Enter your custom description here..."
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          className="h-64 bg-slate-800 border-slate-700 resize-none"
                        />
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="loginInfo" className="text-slate-300">Login Information</Label>
                      <Textarea
                        id="loginInfo"
                        placeholder="Provide login details (email and game credentials)"
                        value={formData.loginInfo}
                        onChange={(e) => setFormData({ ...formData, loginInfo: e.target.value })}
                        className="h-32 bg-slate-800 border-slate-700 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-slate-300">Price (USD)</Label>
                      <div className="relative">
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="pl-8 bg-slate-800 border-slate-700"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-medium shadow-lg shadow-blue-700/20"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating Listing...
                    </>
                  ) : (
                    'Update Listing'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 