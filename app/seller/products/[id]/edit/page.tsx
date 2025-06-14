"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Plus, Loader2, Shield, Upload, X, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ItemInput {
  id: string;
  type: string;
  name: string;
}

interface ProductData {
  id: number;
  title: string;
  price: number;
  description: string;
  level: number;
  platform: string;
  items: ItemInput[];
  images: string[];
  featured: boolean;
  instantDelivery: boolean;
}

const mockProduct: ProductData = {
  id: 1,
  title: "Rare OG Fortnite Account",
  price: 99.99,
  description: "Level 100 account with rare skins and emotes...",
  level: 100,
  platform: "pc",
  items: [
    { id: "1", type: "skin", name: "Renegade Raider" },
    { id: "2", type: "emote", name: "Floss" }
  ],
  images: [
    "https://picsum.photos/400/400?random=1",
    "https://picsum.photos/400/400?random=2"
  ],
  featured: true,
  instantDelivery: false
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [items, setItems] = useState<ItemInput[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [instantDelivery, setInstantDelivery] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProduct(mockProduct);
        setItems(mockProduct.items);
        setImages(mockProduct.images);
        setFeatured(mockProduct.featured);
        setInstantDelivery(mockProduct.instantDelivery);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load product details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual product update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Product Updated',
        description: 'Your listing has been updated successfully.',
      });
      
      router.push('/seller');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

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
            <CardTitle>Edit Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-8 bg-yellow-500/10 border-yellow-500/20 text-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Changes to your listing will be reviewed before going live. This helps maintain marketplace quality.
              </AlertDescription>
            </Alert>

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
                      defaultValue={product.title}
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
                      defaultValue={product.price}
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
                    defaultValue={product.description}
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
                      defaultValue={product.level}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select defaultValue={product.platform} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pc">PC</SelectItem>
                        <SelectItem value="ps4">PlayStation</SelectItem>
                        <SelectItem value="xbox">Xbox</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Switch checked={featured} onCheckedChange={setFeatured} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Instant Delivery</Label>
                      <p className="text-sm text-gray-400">Automatically provide account credentials after purchase</p>
                    </div>
                    <Switch checked={instantDelivery} onCheckedChange={setInstantDelivery} />
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
                        Updating...
                      </>
                    ) : (
                      'Update Listing'
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