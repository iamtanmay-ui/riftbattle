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
import { Loader2, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [epicAccount, setEpicAccount] = useState<EpicGamesAccount | null>(null);
  const { user } = useAuthStore();
  const [isRedirected, setIsRedirected] = useState(false);
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    accountTypes: [] as string[],
    platforms: [] as string[],
    description: DEFAULT_DESCRIPTION, // Use the default description
    loginInfo: '',
    price: '',
    title: '', // Add title field
  });
  
  // Add a state for using default description
  const [useDefaultDescription, setUseDefaultDescription] = useState(true);
  const [customDescription, setCustomDescription] = useState('');

  // Add useEffect to check URL parameters and fetch account data
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isEpicRedirect = searchParams.get('epic_redirect') === 'true';

    if (isEpicRedirect && !isRedirected) {
      setIsRedirected(true);
      fetchAccountData();
    }
  }, []);

  const fetchAccountData = async (retryCount = 0) => {
    try {
      setIsLoading(true);
      
      // First verify the authentication status
      const verifyResponse = await fetch('/api/seller/verify-auth', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        if (error.error === 'link expired') {
          // If link is expired, trigger a new login
          toast({
            title: 'Session Expired',
            description: 'Please connect your Epic Games account again',
            variant: 'destructive',
          });
          setIsRedirected(false);
          return;
        }
        throw new Error('Failed to verify authentication');
      }

      // Now try to fetch the skins
      const response = await fetch('/api/seller/get_skins', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        // If we get a timeout and haven't exceeded retry attempts
        if (response.status === 504 && retryCount < 3) {
          console.log(`Retry attempt ${retryCount + 1} after timeout...`);
          // Wait for 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchAccountData(retryCount + 1);
        }
        throw new Error(error.error || 'Failed to fetch account data');
      }

      const accountData = await response.json();
      console.log('Received Epic account data:', accountData);

      if (accountData.id) {
        setEpicAccount({
          id: accountData.id,
          displayName: accountData.displayName,
          email: accountData.email,
          cosmetics: {
            skins: accountData.skins || [],
            backblings: accountData.backblings || [],
            emotes: accountData.emotes || [],
            pickaxes: accountData.pickaxes || [],
            gliders: accountData.gliders || [],
          },
          cosmeticCounts: {
            skins: accountData.skins?.length || 0,
            backblings: accountData.backblings?.length || 0,
            emotes: accountData.emotes?.length || 0,
            pickaxes: accountData.pickaxes?.length || 0,
            gliders: accountData.gliders?.length || 0,
          }
        });

        toast({
          title: 'Success',
          description: 'Epic Games account data loaded successfully!',
        });
      }
    } catch (error: any) {
      console.error('Error fetching account data:', error);
      // If we haven't exceeded retry attempts and it's a network error
      if (error.message.includes('network') && retryCount < 3) {
        console.log(`Retry attempt ${retryCount + 1} after network error...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchAccountData(retryCount + 1);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to load Epic Games account data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to generate title based on platforms and cosmetics
  const generateTitle = () => {
    if (!epicAccount) return '';

    // Get platforms shorthand
    const platformsShorthand: string[] = [];
    if (formData.platforms.includes('pc')) platformsShorthand.push('PC');
    if (formData.platforms.includes('xbox')) platformsShorthand.push('XBOX');
    if (formData.platforms.includes('ps4')) platformsShorthand.push('PSN');
    if (formData.platforms.includes('switch')) platformsShorthand.push('SWITCH');
    if (formData.platforms.includes('mobile')) platformsShorthand.push('MOBILE');

    // Get top 4 skins (or fewer if there aren't 4)
    const skins = epicAccount.cosmetics.skins.slice(0, 4).map(skin => skin.name);
    
    // Add some notable emotes if available
    const emotes = epicAccount.cosmetics.emotes.map(emote => emote.name);
    
    // Combine all notable cosmetics
    const notableCosmetics = [...skins, ...emotes];
    
    // Format the title
    let title = '';
    
    // Add platforms
    if (platformsShorthand.length > 0) {
      title += `[${platformsShorthand.join(',')}] `;
    }
    
    // Add skin count
    title += `${epicAccount.cosmeticCounts.skins} skins`;
    
    // Add notable cosmetics
    if (notableCosmetics.length > 0) {
      title += ' | ' + notableCosmetics.slice(0, 4).join(' | ');
    }
    
    return title;
  };

  // Update title automatically when platforms change
  const updatePlatforms = (newPlatforms: string[]) => {
    setFormData({ 
      ...formData, 
      platforms: newPlatforms,
      title: generateTitle() // Auto-generate title
    });
  };

  // Update the platform checkbox handling to use the new function
  const handlePlatformChange = (platform: string, checked: boolean) => {
    const platforms = new Set(formData.platforms || []);
    if (checked) {
      platforms.add(platform);
    } else {
      platforms.delete(platform);
    }
    const newPlatforms = Array.from(platforms);
    updatePlatforms(newPlatforms);
  };

  const handleEpicLogin = async () => {
    try {
      // Verify user role first
      const roleResponse = await fetch('/api/auth/role');
      if (!roleResponse.ok) {
        throw new Error('Failed to verify user role');
      }

      // Get Epic Games auth link
      const linkResponse = await fetch('/api/seller/get-link');
      if (!linkResponse.ok) {
        throw new Error('Failed to get Epic Games auth link');
      }

      const { verification_uri_complete, device_code, expires_in, interval } = await linkResponse.json();
      
      // Store device code in state
      setDeviceCode(device_code);
      
      // Open Epic Games auth window
      window.open(verification_uri_complete, '_blank');

      // Start polling for auth completion
      const startTime = Date.now();
      const pollInterval = (interval || 5) * 1000; // Convert to milliseconds, default to 5 seconds
      const expiresIn = (expires_in || 600) * 1000; // Convert to milliseconds, default to 10 minutes

      while (Date.now() - startTime < expiresIn) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Try to fetch skins
        try {
          const accountResponse = await fetch(`/api/seller/get_skins?device_code=${device_code}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            }
          });

          if (!accountResponse.ok) {
            const error = await accountResponse.json();
            if (error.error === 'link expired') {
              // Continue polling if link is not yet active
              continue;
            }
            throw new Error(error.error || 'Failed to fetch account data');
          }

          const accountData = await accountResponse.json();
          console.log('Account data:', accountData);

          if (accountData.athena_ids) {
            setEpicAccount({
              id: accountData.athena_ids[0] || '',
              displayName: accountData.suggested_name || '',
              email: '',
              cosmetics: {
                skins: accountData.athena_ids.map((id: string) => ({
                  id,
                  name: id,
                  image: ''
                })) || [],
                backblings: [],
                emotes: [],
                pickaxes: [],
                gliders: []
              },
              cosmeticCounts: {
                skins: accountData.skins_count || 0,
                backblings: accountData.backpacks_count || 0,
                emotes: accountData.emotes_count || 0,
                pickaxes: accountData.pickaxes_count || 0,
                gliders: accountData.glider_count || 0
              }
            });

            // Create the product listing
            const productData = {
              title: accountData.suggested_name || `Fortnite Account with ${accountData.skins_count} skins`,
              description: DEFAULT_DESCRIPTION,
              accountTypes: ['standard'],
              platforms: ['pc'], // Default to PC, user can modify later
              loginInfo: '', // Will be filled by user
              price: 0, // Will be set by user
              epicAccount: {
                id: accountData.athena_ids[0] || '',
                displayName: accountData.suggested_name || '',
                cosmeticCounts: {
                  skins: accountData.skins_count || 0,
                  backblings: accountData.backpacks_count || 0,
                  emotes: accountData.emotes_count || 0,
                  pickaxes: accountData.pickaxes_count || 0,
                  gliders: accountData.glider_count || 0
                }
              }
            };

            // Store the product data in state for the form
            setFormData({
              ...formData,
              title: productData.title,
              description: DEFAULT_DESCRIPTION,
              accountTypes: ['standard'],
              platforms: ['pc']
            });

            toast({
              title: 'Success',
              description: 'Successfully connected Epic Games account! Please complete the listing details below.',
            });
            return;
          }
        } catch (error: any) {
          // If it's a link expired error, continue polling
          if (error.message?.includes('link expired')) {
            continue;
          }
          throw error;
        }
      }

      throw new Error('Authentication timed out. Please try again.');

    } catch (error: any) {
      console.error('Epic Games login error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to connect Epic Games account',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!epicAccount) {
      toast({
        title: 'Error',
        description: 'Please connect your Epic Games account first',
        variant: 'destructive',
      });
      return;
    }

    if (formData.accountTypes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one account type',
        variant: 'destructive',
      });
      return;
    }

    if (formData.platforms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.loginInfo.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide login information',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a listing title',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the submission data
      const submissionData = {
        name: formData.title.trim(),
        description: useDefaultDescription ? DEFAULT_DESCRIPTION : customDescription,
        price: parseFloat(formData.price),
        athena_ids: epicAccount.cosmetics.skins.map((skin: any) => skin.id),
        stats: {
          level: epicAccount.cosmeticCounts.skins?.toString() || "1",
          backpacks: epicAccount.cosmeticCounts.backblings?.toString() || "0"
        },
        credentials: formData.loginInfo.trim(),
        active: true,
        discount: 0
      };

      // Make the API call
      const response = await fetch('/api/seller/create_product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Don't manually set Authorization header, let the browser handle cookies
        },
        credentials: 'include', // Important: include credentials
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const createdProduct = await response.json();
      console.log('Created product:', createdProduct);

      toast({
        title: 'Success',
        description: 'Your listing has been created successfully!',
      });

      // Redirect to the seller dashboard
      router.push('/seller/listings');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12">
      <div className="w-full max-w-4xl mx-auto px-4">
        <Card className="bg-slate-800/50 border-slate-700/50 shadow-xl shadow-blue-900/10">
          <CardHeader className="text-center border-b border-slate-700/50 pb-6">
            <CardTitle className="text-2xl font-bold text-white">Create New Listing</CardTitle>
            <CardDescription className="text-slate-300 mt-2">
              Connect your Epic Games account and provide additional details to create your listing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {!epicAccount ? (
              <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center">
                <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50 w-full">
                  <h3 className="text-xl font-semibold text-white mb-4">Epic Games Account Connection</h3>
                  <p className="text-slate-400 mb-6">
                    First, connect your Epic Games account to import your cosmetics and account details.
                  </p>
                  <Button
                    onClick={handleEpicLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 flex items-center justify-center gap-2 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        Connect Epic Games Account
                      </>
                    )}
                  </Button>
                  <p className="mt-4 text-xs text-slate-500">
                    You'll be redirected to Epic Games for authentication
                  </p>
                </div>
              </div>
            ) : (
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
                    <div className="space-y-2">
                      <Label className="text-slate-300">Account Type</Label>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800 border border-slate-700 rounded-md">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="type-standard"
                            checked={formData.accountTypes?.includes('standard')}
                            onCheckedChange={(checked) => {
                              const types = new Set(formData.accountTypes || []);
                              if (checked) {
                                types.add('standard');
                              } else {
                                types.delete('standard');
                              }
                              setFormData({ ...formData, accountTypes: Array.from(types) });
                            }}
                          />
                          <label
                            htmlFor="type-standard"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            Standard Account
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="type-og"
                            checked={formData.accountTypes?.includes('og')}
                            onCheckedChange={(checked) => {
                              const types = new Set(formData.accountTypes || []);
                              if (checked) {
                                types.add('og');
                              } else {
                                types.delete('og');
                              }
                              setFormData({ ...formData, accountTypes: Array.from(types) });
                            }}
                          />
                          <label
                            htmlFor="type-og"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            OG Account
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="type-stacked"
                            checked={formData.accountTypes?.includes('stacked')}
                            onCheckedChange={(checked) => {
                              const types = new Set(formData.accountTypes || []);
                              if (checked) {
                                types.add('stacked');
                              } else {
                                types.delete('stacked');
                              }
                              setFormData({ ...formData, accountTypes: Array.from(types) });
                            }}
                          />
                          <label
                            htmlFor="type-stacked"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            Stacked Account
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Device/Platform</Label>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800 border border-slate-700 rounded-md">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="platform-pc"
                            checked={formData.platforms?.includes('pc')}
                            onCheckedChange={(checked) => handlePlatformChange('pc', !!checked)}
                          />
                          <label
                            htmlFor="platform-pc"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            PC
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="platform-ps4"
                            checked={formData.platforms?.includes('ps4')}
                            onCheckedChange={(checked) => handlePlatformChange('ps4', !!checked)}
                          />
                          <label
                            htmlFor="platform-ps4"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            PlayStation
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="platform-xbox"
                            checked={formData.platforms?.includes('xbox')}
                            onCheckedChange={(checked) => handlePlatformChange('xbox', !!checked)}
                          />
                          <label
                            htmlFor="platform-xbox"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            Xbox
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="platform-switch"
                            checked={formData.platforms?.includes('switch')}
                            onCheckedChange={(checked) => handlePlatformChange('switch', !!checked)}
                          />
                          <label
                            htmlFor="platform-switch"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            Nintendo Switch
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="platform-mobile"
                            checked={formData.platforms?.includes('mobile')}
                            onCheckedChange={(checked) => handlePlatformChange('mobile', !!checked)}
                          />
                          <label
                            htmlFor="platform-mobile"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                          >
                            Mobile
                          </label>
                        </div>
                      </div>
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

                    {/* Title field with auto-generation */}
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="title" className="text-slate-300">Listing Title</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setFormData({...formData, title: generateTitle()})}
                          className="text-xs bg-blue-900/30 hover:bg-blue-800/40 border-blue-800/30 text-blue-300"
                        >
                          Auto-Generate Title
                        </Button>
                      </div>
                      <Input
                        id="title"
                        placeholder="Enter a title for your listing"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Format: [PLATFORMS] skin count | Skin 1 | Skin 2 | Emote 1 | etc.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-medium shadow-lg shadow-blue-700/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    'Create Listing'
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