"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Plus, Loader2, Shield, Upload, X } from 'lucide-react';

interface ItemInput {
  id: string;
  type: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<ItemInput[]>([]);
  const [images, setImages] = useState<string[]>([]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), type: '', name: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ItemInput, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddImage = (url: string) => {
    if (images.length < 5) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Add these state variables at the top
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  
  // Add this handler for multiple selections
  const handlePlatformChange = (value: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(value) 
        ? prev.filter(p => p !== value) 
        : [...prev, value]
    );
  };
  
  const handleDeviceChange = (value: string) => {
    setSelectedDevices(prev => 
      prev.includes(value) 
        ? prev.filter(d => d !== value) 
        : [...prev, value]
    );
  };
  
  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const formData = new FormData(e.currentTarget);
      const skinItems = items.filter(item => item.type === 'skin');
      
      const productData = {
        title: formData.get('title') as string,
        price: parseFloat(formData.get('price') as string),
        description: formData.get('description') as string,
        accountDetails: {
          level: parseInt(formData.get('level') as string),
          platforms: selectedPlatforms,
          devices: selectedDevices
        },
        items: items,
        images: images,
        settings: {
          featured: formData.get('featured') === 'on',
          instantDelivery: formData.get('instant_delivery') === 'on'
        }
      };
  
      const response = await fetch('/api/seller/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
        credentials: 'include'
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create listing');
      }

      toast({
        title: 'Success',
        description: 'Your listing has been created successfully.',
      });
      
      router.push('/seller');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-8 text-gray-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle>Create New Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Rare OG Fortnite Account"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your account in detail..."
                    className="h-32"
                    required
                  />
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Account Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Account Level</Label>
                    <Input
                      id="level"
                      type="number"
                      min="1"
                      placeholder="Enter account level"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Platforms</Label>
                    <div className="flex gap-2 flex-wrap">
                      {['pc', 'ps4', 'ps5', 'xbox', 'switch'].map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                          onClick={() => handlePlatformChange(platform)}
                          className="capitalize"
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Compatible Devices</Label>
                    <div className="flex gap-2 flex-wrap">
                      {['mobile', 'tablet', 'console', 'desktop'].map((device) => (
                        <Button
                          key={device}
                          type="button"
                          variant={selectedDevices.includes(device) ? "default" : "outline"}
                          onClick={() => handleDeviceChange(device)}
                          className="capitalize"
                        >
                          {device}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Items</h3>
                  <Button type="button" variant="outline" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <Select
                        value={item.type}
                        onValueChange={(value) => handleItemChange(item.id, 'type', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Item type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skin">Skin</SelectItem>
                          <SelectItem value="emote">Emote</SelectItem>
                          <SelectItem value="pickaxe">Pickaxe</SelectItem>
                          <SelectItem value="glider">Glider</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-40 w-full flex flex-col items-center justify-center gap-2"
                      onClick={() => handleAddImage(`https://picsum.photos/400/400?random=${Date.now()}`)}
                    >
                      <Upload className="h-6 w-6" />
                      <span>Add Image</span>
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-400">Upload up to 5 images (screenshots of inventory, stats, etc.)</p>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Featured Listing</Label>
                      <p className="text-sm text-gray-400">Promote your listing at the top of search results</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Instant Delivery</Label>
                      <p className="text-sm text-gray-400">Automatically provide account credentials after purchase</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                <div className="flex items-center text-sm text-gray-400">
                  <Shield className="h-4 w-4 mr-2" />
                  Protected by Rift Battle Secure Trading
                </div>
                <div className="space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Listing'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}