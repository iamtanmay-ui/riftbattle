"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EditListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Get the listing ID from the search params
  const listingId = searchParams.get('id');
  
  // Form state
  const [formData, setFormData] = useState({
    title: 'OG Fortnite Account with Rare Skins',
    accountType: 'og',
    platform: 'pc',
    description: `✅ Instant Delivery ✅
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
• After purchasing the account make sure to change all of the information (email password & epic games password) because if anything happens, we must be provided with email access by the buyer!`,
    price: '120.00',
  });
  
  // Add a state for using default description
  const [useDefaultDescription, setUseDefaultDescription] = useState(true);
  const [customDescription, setCustomDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Prepare the submission data with the correct description
    const submissionData = {
      ...formData,
      description: useDefaultDescription ? formData.description : customDescription,
    };

    try {
      // In a real app, this would be an API call to update the listing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Your listing has been updated',
      });
      
      // Redirect to the seller dashboard
      router.push('/seller/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update listing',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/seller/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
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
                      {formData.description}
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

              <div className="space-y-2">
                <Label htmlFor="price" className="text-slate-300">Price (USD)</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="pl-8 bg-slate-800 border-slate-700"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 