"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getProduct, getSellerInfo, getAthenaIds } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/store';
import { Loader2, Shield, GamepadIcon, User, Star, ChevronLeft, ShoppingCart, Zap, Clock, CheckCircle, ImageIcon } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';

interface Product {
  id: number;
  name: string;
  price: number;
  stats: {
    level?: string;
    backpacks?: string;
    rarity?: string;
    vbucks?: string;
    [key: string]: string | undefined;
  };
  athena_ids: string[];
  images?: string[];
  seller_id: number;
  description?: string;
  cosmetics?: {
    outfits?: string[];
    pickaxes?: string[];
    gliders?: string[];
    emotes?: string[];
    [key: string]: string[] | undefined;
  };
}

interface CosmeticItem {
  id: string;
  name: string;
  rarity: string;
  image: string;
}

interface LockerItems {
  outfits: CosmeticItem[];
  backblings: CosmeticItem[];
  emotes: CosmeticItem[];
  pickaxes: CosmeticItem[];
  gliders: CosmeticItem[];
}

interface Seller {
  seller_name: string;
  rating?: number;
  reviews?: number;
  member_since?: string;
  response_time?: string;
  last_online?: string;
}

const MAX_VISIBLE_ITEMS = 6; // Number of items to show in view

function getImageUrl(id: string, type: string): string {
  // Clean the ID for URL
  const cleanId = id.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  // Base URL for Fortnite images
  const baseUrl = 'https://media.fortniteapi.io/images/cosmetics/br';
  
  // Generate URL based on type
  switch (type.toLowerCase()) {
    case 'outfit':
      return `${baseUrl}/characters/${cleanId}.png`;
    case 'backbling':
      return `${baseUrl}/backpacks/${cleanId}.png`;
    case 'emote':
      return `${baseUrl}/emotes/${cleanId}.png`;
    case 'pickaxe':
      return `${baseUrl}/harvesting_tools/${cleanId}.png`;
    case 'glider':
      return `${baseUrl}/gliders/${cleanId}.png`;
    default:
      return `${baseUrl}/cosmetics/${cleanId}.png`;
  }
}

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const addToCart = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState("PlayStation");
  const [activeLockerTab, setActiveLockerTab] = useState<string>("outfits");
  const [isClient, setIsClient] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [lockerItems, setLockerItems] = useState<LockerItems>({
    outfits: [],
    backblings: [],
    emotes: [],
    pickaxes: [],
    gliders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fix hydration issues by only rendering on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const productId = parseInt(id, 10);

  const { data: productData, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
  });

  const { data: seller, isLoading: sellerLoading } = useQuery<Seller>({
    queryKey: ['seller', productData?.seller_id],
    queryFn: () => getSellerInfo(productData?.seller_id as number),
    enabled: !!productData?.seller_id,
  });

  const cosmeticsQueryOptions: UseQueryOptions = {
    queryKey: ['athena_ids'],
    queryFn: getAthenaIds,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  };

  const { isLoading: cosmeticsLoading } = useQuery(cosmeticsQueryOptions);

  useEffect(() => {
    const fetchProductAndItems = async () => {
      try {
        console.log('Fetching product details for ID:', id);
        // Fetch product details
        const productResponse = await fetch(`/api/get_product?id=${id}`);
        if (!productResponse.ok) {
          console.error('Failed to fetch product:', productResponse.status, productResponse.statusText);
          throw new Error('Failed to fetch product');
        }
        const productData = await productResponse.json();
        console.log('Received product data:', productData);
        setProduct(productData);

        if (!productData.athena_ids || !Array.isArray(productData.athena_ids)) {
          console.error('Invalid athena_ids in product data:', productData.athena_ids);
          return;
        }

        console.log('Fetching cosmetic details for athena_ids:', productData.athena_ids);
        // Fetch cosmetic details for each Athena ID
        const cosmeticPromises = productData.athena_ids.map(async (athenaId: string) => {
          try {
            console.log('Fetching details for athenaId:', athenaId);
            const response = await fetch(`/api/get_skins_info?athenaID=${athenaId}`);
            if (!response.ok) {
              console.error(`Failed to fetch details for ${athenaId}:`, response.status, response.statusText);
              return null;
            }
            const data = await response.json();
            console.log('Received cosmetic details for', athenaId, ':', data);
            return data;
          } catch (error) {
            console.error(`Error fetching cosmetic details for ${athenaId}:`, error);
            return null;
          }
        });

        const cosmeticResults = await Promise.all(cosmeticPromises);
        console.log('All cosmetic results:', cosmeticResults);
        
        // Organize items by type
        const items: LockerItems = {
          outfits: [],
          backblings: [],
          emotes: [],
          pickaxes: [],
          gliders: []
        };

        cosmeticResults.forEach(result => {
          if (!result) {
            console.log('Skipping null result');
            return;
          }

          console.log('Processing cosmetic item:', result);
          // Add item to appropriate category based on type
          switch (result.type) {
            case 'outfit':
              console.log('Adding outfit:', result);
              items.outfits.push(result);
              break;
            case 'backbling':
              console.log('Adding backbling:', result);
              items.backblings.push(result);
              break;
            case 'emote':
              console.log('Adding emote:', result);
              items.emotes.push(result);
              break;
            case 'pickaxe':
              console.log('Adding pickaxe:', result);
              items.pickaxes.push(result);
              break;
            case 'glider':
              console.log('Adding glider:', result);
              items.gliders.push(result);
              break;
            default:
              console.log('Unknown item type:', result.type, 'for item:', result);
              break;
          }
        });

        console.log('Final organized items:', items);
        setLockerItems(items);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductAndItems();
    }
  }, [id]);

  // Rarity color functions
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      case 'marvel': return 'from-red-400 to-red-600';
      case 'icon': return 'from-blue-300 to-blue-500';
      default: return 'from-blue-400 to-blue-600'; // Default to Rare
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'marvel': return 'bg-red-500';
      case 'icon': return 'bg-blue-400';
      default: return 'bg-blue-500'; // Default to Rare
    }
  };

  const isInCart = cartItems.some((item) => item.id === productId);

  const handleAddToCart = () => {
    if (!productData) return;
    
    if (isInCart) {
      toast({
        title: 'Already in cart',
        description: 'This item is already in your cart',
      });
      return;
    }

    addToCart({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      quantity: 1,
      image: productData.images?.[0] || '/images/placeholder-1.jpg',
    });

    toast({
      title: 'Added to cart',
      description: 'Item has been added to your cart',
    });
  };

  // Use placeholder images only when API doesn't provide any
  const placeholderImages = [
    '/images/placeholder-1.jpg',
    '/images/placeholder-2.jpg',
    '/images/placeholder-3.jpg',
  ];

  const images = productData?.images?.length ? productData.images : placeholderImages;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Update the renderCosmeticSection to use actual data
  const renderCosmeticSection = (title: string, items: CosmeticItem[]) => {
    if (items.length === 0) return null;

    return (
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
  };

  if (productLoading || sellerLoading || !productData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-8 text-gray-400 hover:text-white"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>

          {/* Product Header - Similar to the image */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8">
            <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>{productData.name}</span>
              <Badge className="ml-2 bg-yellow-500/20 text-yellow-400">⭐ {productData.stats?.rarity || 'GOLD'}</Badge>
            </h1>
            <div className="flex flex-wrap gap-2">
              {productData.athena_ids && productData.athena_ids.map((id: string, index: number) => {
                // Clean up the ID (remove quotes and extra spaces)
                const cleanId = id.replace(/^"|"$/g, '').trim();
                
                // Find the cosmetic item in the cosmetics data
                const cosmeticItem = lockerItems.outfits?.find((c: any) => c.id === cleanId);
                let name = "";
                
                if (cosmeticItem) {
                  name = cosmeticItem.name;
                } else {
                  if (cleanId.includes('Penguin')) {
                    name = "Penguin";
                  } else if (cleanId.includes('Floss')) {
                    name = "Floss";  
                  } else if (cleanId.includes('Cyclone')) {
                    name = "Travis Scott";
                  } else if (cleanId.includes('Ruby')) {
                    name = "Ruby";
                  } else {
                    // Improved ID transformation with specific patterns
                    name = cleanId
                      .replace(/^([A-Za-z]+)_\d+_/i, '') // Remove prefix with numbers (CID_371_)
                      .replace(/^cid_\d+_/i, '')  // Remove cid prefix with numbers
                      .replace(/^bid_\d+_/i, '')  // Remove bid prefix
                      .replace(/^eid_\d+_/i, '')  // Remove eid prefix
                      .replace(/^athena_commando_[fm]_/i, '') // Remove Athena Commando prefix
                      .replace(/Athena[_\s]Commando[_\s][MF][_\s]/i, '')
                      .replace(/Athena/i, '')
                      .replace(/_/g, ' ')  // Replace underscores with spaces
                      .replace(/\s+/g, ' ') // Normalize spaces
                      .split(' ')
                      .filter(Boolean) // Remove empty strings
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ')
                      .trim();
                    
                    // If still empty or just the ID, make a more human-readable version
                    if (!name || name === cleanId) {
                      name = "Item " + cleanId.slice(-4);
                    }
                  }
                }
                
                return (
                  <Badge key={index} variant="outline" className="bg-slate-800 text-white border-slate-700">
                    {name}
                  </Badge>
                );
              })}
              <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <Image 
                  src="/images/vbucks.png" 
                  alt="V-Bucks" 
                  width={18} 
                  height={18} 
                  className="object-contain" 
                /> 
                {productData.stats?.vbucks || '910 VB'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image Gallery */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden mb-8">
                <CardContent className="p-0 relative">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image 
                      src={images[currentImageIndex]}
                      alt={`Screenshot ${currentImageIndex + 1}`}
                      width={800}
                      height={450}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
                  >
                    <ChevronLeft className="h-6 w-6 transform rotate-180" />
                  </button>
                </CardContent>
              </Card>

              {/* Product Stats */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Account Details</h2>
                  
                  {productData.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                      <p className="text-gray-300">{productData.description}</p>
                      <Separator className="my-6" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {productData.stats && Object.entries(productData.stats).map(([key, value]) => (
                      <div key={key} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1 capitalize">{key}</div>
                        <div className="text-white font-bold">{value}</div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Locker View */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">Locker Items</h2>
                    
                    {/* Tabs for cosmetic types */}
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {Object.keys(lockerItems).map((type) => (
                        <Button
                          key={type}
                          variant={activeLockerTab === type ? "default" : "outline"}
                          className={`transition-all duration-200 ${
                            activeLockerTab === type 
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                              : "bg-slate-800/80 border-slate-700 hover:bg-slate-700"
                          }`}
                          onClick={() => setActiveLockerTab(type)}
                        >
                          {type === 'outfits' ? 'Skins' : type.charAt(0).toUpperCase() + type.slice(1)}
                          <Badge className="ml-2 bg-blue-500/30 text-blue-200 text-xs">
                            {lockerItems[type as keyof typeof lockerItems].length}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                    
                    {/* Cosmetic items grid */}
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      {cosmeticsLoading ? (
                        <div className="h-40 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <>
                          <div className="mb-2 flex justify-between items-center">
                            <h3 className="text-white font-medium">
                              {activeLockerTab === 'outfits' && `${lockerItems.outfits.length} skins`}
                              {activeLockerTab === 'pickaxes' && `${lockerItems.pickaxes.length} pickaxes`}
                              {activeLockerTab === 'gliders' && `${lockerItems.gliders.length} gliders`}
                              {activeLockerTab === 'emotes' && `${lockerItems.emotes.length} emotes`}
                              {activeLockerTab === 'backblings' && `${lockerItems.backblings.length} backblings`}
                            </h3>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1 h-auto">
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {lockerItems[activeLockerTab as keyof typeof lockerItems].length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                              No {activeLockerTab} found in this account
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="overflow-x-auto pb-4 hide-scrollbar">
                                <div className="flex space-x-3" style={{ minWidth: 'min-content' }}>
                                  {lockerItems[activeLockerTab as keyof typeof lockerItems].map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex-shrink-0">
                                      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all duration-200 group">
                                        <div className={`absolute inset-0 bg-gradient-to-b ${getRarityColor(item.rarity || 'Rare')} opacity-20`}></div>
                                        <Image
                                          src={getImageUrl(item.id, activeLockerTab)}
                                          alt={item.name}
                                          fill
                                          className="object-cover p-1 group-hover:scale-105 transition-transform duration-200"
                                          unoptimized
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-item.png';
                                          }}
                                        />
                                        {/* Rarity Badge */}
                                        <div className={`absolute top-0 right-0 w-2 h-full ${getRarityBgColor(item.rarity || 'Rare')}`}></div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                          <div className="text-xs text-center text-white truncate font-medium">{item.name}</div>
                                        </div>
                                        {/* Hover info */}
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2">
                                          <div className="text-center">
                                            <div className="text-xs text-white font-bold mb-1">{item.name}</div>
                                            <Badge className={`${getRarityBgColor(item.rarity || 'Rare')} text-white text-xs`}>
                                              {item.rarity || 'Rare'}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Scroll indicators */}
                              <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-slate-900/50 to-transparent pointer-events-none" />
                              <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-900/50 to-transparent pointer-events-none" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">Included Skins & Items</h2>
                    <div className="flex flex-wrap gap-2">
                      {productData.athena_ids && productData.athena_ids.map((id: string, index: number) => {
                        // Clean up the ID (remove quotes and extra spaces)
                        const cleanId = id.replace(/^"|"$/g, '').trim();
                        
                        // Find the cosmetic item in the cosmetics data
                        const cosmeticItem = lockerItems.outfits?.find((c: any) => c.id === cleanId);
                        let name = "";
                        
                        if (cosmeticItem) {
                          name = cosmeticItem.name;
                        } else {
                          if (cleanId.includes('Penguin')) {
                            name = "Penguin";
                          } else if (cleanId.includes('Floss')) {
                            name = "Floss";  
                          } else if (cleanId.includes('Cyclone')) {
                            name = "Travis Scott";
                          } else if (cleanId.includes('Ruby')) {
                            name = "Ruby";
                          } else {
                            // Improved ID transformation with specific patterns
                            name = cleanId
                              .replace(/^([A-Za-z]+)_\d+_/i, '') // Remove prefix with numbers (CID_371_)
                              .replace(/^cid_\d+_/i, '')  // Remove cid prefix with numbers
                              .replace(/^bid_\d+_/i, '')  // Remove bid prefix
                              .replace(/^eid_\d+_/i, '')  // Remove eid prefix
                              .replace(/^athena_commando_[fm]_/i, '') // Remove Athena Commando prefix
                              .replace(/Athena[_\s]Commando[_\s][MF][_\s]/i, '')
                              .replace(/Athena/i, '')
                              .replace(/_/g, ' ')  // Replace underscores with spaces
                              .replace(/\s+/g, ' ') // Normalize spaces
                              .split(' ')
                              .filter(Boolean) // Remove empty strings
                              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(' ')
                              .trim();
                            
                            // If still empty or just the ID, make a more human-readable version
                            if (!name || name === cleanId) {
                              name = "Item " + cleanId.slice(-4);
                            }
                          }
                        }
                        
                        return (
                          <Badge key={index} variant="outline" className="bg-slate-800 text-white border-slate-700">
                            {name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Purchase Info */}
            <div className="space-y-6">
              {/* Device and Delivery Info */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Device</span>
                      <div className="flex items-center">
                        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PlayStation">PlayStation</SelectItem>
                            <SelectItem value="Xbox">Xbox</SelectItem>
                            <SelectItem value="PC">PC</SelectItem>
                            <SelectItem value="Switch">Switch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Delivery time</span>
                      <div className="flex items-center text-blue-400">
                        <Zap className="h-4 w-4 mr-1" />
                        <span>Instant</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Warranty</span>
                      <span className="text-white">10 Days Free</span>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="text-center text-sm text-gray-400">
                      You can't buy your own item
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price and Purchase */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-white">Price</span>
                    <span className="text-2xl font-bold text-white">${productData.price}</span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mb-4"
                    onClick={handleAddToCart}
                    disabled={isInCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isInCart ? 'In Cart' : 'Add to Cart'}
                  </Button>

                  <div className="flex items-center justify-center text-sm text-gray-400 mb-4">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span>100% Secure Payments guarantee by TradeShield</span>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold mb-4">Seller Information</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{seller?.seller_name || 'OgMath'}</h3>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{seller?.rating || '99.4%'} ({seller?.reviews || '4066'} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Member since</span>
                      <span className="text-white">{seller?.member_since || 'Jan 2023'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Response time</span>
                      <span className="text-white">{seller?.response_time || '~1 hour'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Last online</span>
                      <span className="text-white">{seller?.last_online || '11 days ago'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* More like this */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">More like this</h3>
                  <Button variant="link" className="text-blue-400 p-0">All offers</Button>
                </div>
                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div className="text-sm">
                          <p className="text-white font-medium">{productData.name}</p>
                          <p className="text-gray-400 flex items-center">
                            {productData.stats?.rarity || '97.7%'} (
                            <Image 
                              src="/images/vbucks.png" 
                              alt="V-Bucks" 
                              width={14} 
                              height={14} 
                              className="object-contain mx-1" 
                            />
                            {productData.stats?.vbucks || '9125'})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">${productData.price}</p>
                          <p className="text-blue-400 text-xs flex items-center justify-end">
                            <Zap className="h-3 w-3 mr-1" /> Instant
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div className="text-sm">
                          <p className="text-white font-medium">{productData.name}</p>
                          <p className="text-gray-400 flex items-center">
                            {productData.stats?.rarity || '97.7%'} (
                            <Image 
                              src="/images/vbucks.png" 
                              alt="V-Bucks" 
                              width={14} 
                              height={14} 
                              className="object-contain mx-1" 
                            />
                            {productData.stats?.vbucks || '49423'})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">${productData.price}</p>
                          <p className="text-blue-400 text-xs flex items-center justify-end">
                            <Zap className="h-3 w-3 mr-1" /> Instant
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Recent feedback */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Recent feedback</h2>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-slate-700/50">Accounts</Badge>
                    <span className="text-gray-400">Hig***</span>
                  </div>
                  <span className="text-gray-400 text-sm">11 days ago</span>
                </div>
                <p className="text-white">Great seller, fast delivery and account exactly as described!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
