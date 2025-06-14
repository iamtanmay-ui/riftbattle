"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getProducts, getAthenaIds } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, GamepadIcon, Shield, Grid, List, X, Filter, Sparkles, ChevronDown } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import Image from 'next/image';
import { 
  searchQueryAtom, 
  priceRangeAtom, 
  selectedCategoriesAtom,
  selectedCosmeticsAtom,
  viewModeAtom,
  cosmeticSearchQueryAtom
} from '@/lib/atoms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountCard } from '@/app/components/AccountCard';
import { useFortnite } from '@/hooks/use-fortnite';
import { FortniteCosmetic } from '@/lib/fortnite-api';

interface Product {
  id: string;
  name: string;
  price: number;
  stats?: {
    level?: number;
    backpacks?: number;
    vbucks?: number;
  };
  athena_ids: string[];
  images?: string[];
  platform?: string;
  cosmetics?: string[];
  description?: string;
  rarity?: string;
  season?: string;
}

interface CosmeticItem {
  id: string;
  name: string;
  type?: string;
  rarity?: string;
}

// Add type for cosmetic type keys
type CosmeticTypeKey = 'outfits' | 'pickaxes' | 'emotes' | 'gliders' | 'backblings';

export default function MarketplacePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [priceRange, setPriceRange] = useAtom(priceRangeAtom);
  const [selectedCategories, setSelectedCategories] = useAtom(selectedCategoriesAtom);
  const [selectedCosmetics, setSelectedCosmetics] = useAtom(selectedCosmeticsAtom);
  const [cosmeticSearch, setCosmeticSearch] = useAtom(cosmeticSearchQueryAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [platform, setPlatform] = useState('all');
  const [minPrice, setMinPrice] = useState(priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState(priceRange[1].toString());
  const [showFilters, setShowFilters] = useState(false);
  const { searchResults, isSearching, setSearchQuery: setFortniteSearch } = useFortnite();

  // State for dropdown menus
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const [showCosmeticTypeDropdown, setShowCosmeticTypeDropdown] = useState(false);
  const [activeCosmeticType, setActiveCosmeticType] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showRarityDropdown, setShowRarityDropdown] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  
  // State to track whether filters have been modified but not yet applied
  const [pendingFilters, setPendingFilters] = useState(false);
  
  // State to store filters that will be applied when the Apply button is clicked
  const [filterState, setFilterState] = useState({
    searchQuery: '',
    minPrice: '0',
    maxPrice: '10000',
    platform: 'all',
    selectedCategories: [] as string[],
    selectedCosmetics: [] as string[],
    activeCosmeticType: null as string | null,
    selectedRarity: null as string | null
  });
  
  // Device/Platform options with normalized values
  const deviceOptions = [
    { value: 'PC', label: 'PC', matches: ['pc', 'computer'] },
    { value: 'PlayStation', label: 'PlayStation', matches: ['playstation', 'psn', 'ps4', 'ps5'] },
    { value: 'Xbox', label: 'Xbox', matches: ['xbox', 'xbl', 'xbox one', 'xbox series'] },
    { value: 'Switch', label: 'Switch', matches: ['switch', 'nintendo'] },
    { value: 'Mobile', label: 'Mobile', matches: ['mobile', 'android', 'ios'] }
  ];

  // Cosmetic type options
  const cosmeticTypeOptions = [
    { 
      value: 'outfits' as const, 
      label: 'Outfits',
      filters: [
        'Renegade Raider',
        'Black Knight',
        'Travis Scott',
        'Skull Trooper',
        'Ghoul Trooper',
        'Aerial Assault Trooper',
        'Galaxy',
        'IKONIK',
        'Wonder',
        'Wildcat',
        'The Paradigm',
        'Dark Voyager'
      ]
    },
    { 
      value: 'pickaxes' as const, 
      label: 'Pickaxes',
      filters: [
        'AC/DC',
        'Raiders Revenge',
        'Axecalibur',
        'Party Animal',
        'Rainbow Smash',
        'Trusty No. 2',
        'Reaper',
        'Studded Axe',
        'Star Wand',
        'Harley Hitter',
        'Leviathan Axe',
        'Merry Mint Axe'
      ]
    },
    { 
      value: 'emotes' as const, 
      label: 'Emotes',
      filters: [
        'Floss',
        'The Worm',
        'Ride the Pony',
        'Take the L',
        'Orange Justice',
        'Rambunctious',
        'Fresh',
        'Pop Lock',
        'Scenario',
        'Laugh It Up',
        'Toosie Slide',
        'Renegade'
      ]
    },
    { 
      value: 'gliders' as const, 
      label: 'Gliders',
      filters: [
        'Mako',
        'Aerial Assault One',
        'Snowflake',
        'Founder\'s Umbrella',
        'Season 2 Victory',
        'High Octane',
        'Royale Dragon',
        'Dark Engine',
        'Millennium Falcon',
        'Astroworld Cyclone',
        'Comet Crasher',
        'Mighty Marvel'
      ]
    },
    {
      value: 'backblings' as const,
      label: 'Back Blings',
      filters: [
        'Black Shield',
        'Ghost Portal',
        'Love Wings',
        'Iron Cage',
        'Six String',
        'Galactic Disc',
        'Banner Shield',
        'Spider Shield',
        'Thor\'s Cloak',
        'Frozen Shroud',
        'Dark Wings',
        'Wolfpack'
      ]
    }
  ];
  
  // Define rarity options with proper colors and order
  const rarityOptions = [
    { value: 'mythic', label: 'Mythic', color: 'text-yellow-400' },
    { value: 'legendary', label: 'Legendary', color: 'text-orange-400' },
    { value: 'epic', label: 'Epic', color: 'text-purple-400' },
    { value: 'rare', label: 'Rare', color: 'text-blue-400' },
    { value: 'uncommon', label: 'Uncommon', color: 'text-green-400' },
    { value: 'common', label: 'Common', color: 'text-gray-400' }
  ];

  // Setup selectedFilters state
  const [selectedFilters, setSelectedFilters] = useState({
    outfits: [] as string[],
    pickaxes: [] as string[],
    emotes: [] as string[],
    gliders: [] as string[],
    backblings: [] as string[]
  });

  // Fetch cosmetics data
  const { data: cosmetics, isLoading: cosmeticsLoading } = useQuery({
    queryKey: ['athena_ids'],
    queryFn: getAthenaIds,
  });
  
  // Process cosmetic data to populate cosmetic type filters
  useEffect(() => {
    if (!cosmetics) return;
    
    // Update cosmetic type options with actual filters from data
    const updatedOptions = [...cosmeticTypeOptions];
    
    // Count occurrences of each rarity for each type
    const rarityMap: Record<string, Record<string, number>> = {
      outfits: {},
      pickaxes: {},
      emotes: {},
      gliders: {},
      backblings: {}
    };
    
    // This is our mock data to populate dropdowns with real-looking data
    // These would ideally come from the API
    const mockRarityData = {
      outfits: {
        mythic: 2, 
        legendary: 45, 
        epic: 92, 
        rare: 118, 
        uncommon: 76, 
        common: 34
      },
      pickaxes: {
        mythic: 1,
        legendary: 28, 
        epic: 65, 
        rare: 87, 
        uncommon: 53, 
        common: 41
      },
      emotes: {
        legendary: 12, 
        epic: 36, 
        rare: 67, 
        uncommon: 45, 
        common: 23
      },
      gliders: {
        legendary: 18, 
        epic: 42, 
        rare: 53, 
        uncommon: 37, 
        common: 19
      },
      backblings: {
        mythic: 3,
        legendary: 32, 
        epic: 65, 
        rare: 49, 
        uncommon: 41, 
        common: 14
      }
    };
    
    // Merge real data with mock data (real data would override mock)
    try {
      (cosmetics as CosmeticItem[]).forEach((item) => {
        if (item.type && item.rarity) {
          const type = item.type.toLowerCase();
          const rarity = item.rarity.toLowerCase();
          
          if (rarityMap[type]) {
            rarityMap[type][rarity] = (rarityMap[type][rarity] || 0) + 1;
          }
        }
      });
    } catch (error) {
      console.error("Error processing cosmetics data:", error);
      
      // If there's an error, fall back to mock data
      Object.keys(mockRarityData).forEach(type => {
        Object.entries(mockRarityData[type as keyof typeof mockRarityData]).forEach(([rarity, count]) => {
          if (!rarityMap[type][rarity]) {
            rarityMap[type][rarity] = count;
          }
        });
      });
    }
    
    // If we have no data at all, use mock data
    if (Object.keys(rarityMap).every(type => Object.keys(rarityMap[type]).length === 0)) {
      Object.keys(mockRarityData).forEach(type => {
        Object.entries(mockRarityData[type as keyof typeof mockRarityData]).forEach(([rarity, count]) => {
          rarityMap[type][rarity] = count;
        });
      });
    }
    
    // Add rarity filters to each cosmetic type
    Object.keys(rarityMap).forEach((type) => {
      const typeIndex = updatedOptions.findIndex(opt => opt.value === type);
      if (typeIndex >= 0) {
        updatedOptions[typeIndex].filters = Object.entries(rarityMap[type])
          .map(([rarity, count]) => `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} (${count})`)
          .sort((a, b) => {
            // Sort by rarity hierarchy (rarest first)
            const rarityOrder = ['Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
            const rarityA = a.split(' ')[0];
            const rarityB = b.split(' ')[0];
            return rarityOrder.indexOf(rarityA) - rarityOrder.indexOf(rarityB);
          });
      }
    });
    
    // Update the options
    cosmeticTypeOptions.forEach((option, i) => {
      if (i < updatedOptions.length) {
        option.filters = updatedOptions[i].filters;
      }
    });
  }, [cosmetics]);

  // Calculate cosmetics by rarity with proper typing
  const cosmeticsByRarity = useMemo(() => {
    if (!cosmetics) return {};
    
    return (cosmetics as CosmeticItem[]).reduce((acc: Record<string, CosmeticItem[]>, item: CosmeticItem) => {
      const rarity = item.rarity?.toLowerCase() || 'unknown';
      if (!acc[rarity]) {
        acc[rarity] = [];
      }
      acc[rarity].push(item);
      return acc;
    }, {});
  }, [cosmetics]);

  // Helper function to extract platforms from product name/title
  const extractPlatformsFromTitle = (name: string): string[] => {
    const platformMatches = name.match(/\[(.*?)\]/);
    if (platformMatches && platformMatches[1]) {
      return platformMatches[1].split(',').map(p => p.trim().toLowerCase());
    }
    return [];
  };

  // Helper function to normalize platform names
  const normalizePlatform = (platform: string | undefined): string => {
    if (!platform) return 'unknown';
    
    const normalizedPlatform = platform.toLowerCase().trim();
    
    // Check against our device options matches
    for (const device of deviceOptions) {
      if (device.matches.some(match => normalizedPlatform.includes(match))) {
        return device.value;
      }
    }
    
    return platform; // Return original if no match found
  };

  // Helper function to check if product supports platform
  const productSupportsPlatform = (product: Product, targetPlatform: string): boolean => {
    const normalizedTarget = normalizePlatform(targetPlatform);
    
    // Check explicit platform field
    if (product.platform) {
      const normalizedProductPlatform = normalizePlatform(product.platform);
      if (normalizedProductPlatform === normalizedTarget) {
        return true;
      }
    }
    
    // Check platforms in title
    const titlePlatforms = extractPlatformsFromTitle(product.name);
    return titlePlatforms.some(p => normalizePlatform(p) === normalizedTarget);
  };

  // Handle device selection
  const handleDeviceSelect = (value: string) => {
    setPlatform(value);
    setPendingFilters(true);
    setShowDeviceDropdown(false);
    
    // Update filter state with the new platform value
    setFilterState(prev => ({
      ...prev,
      platform: value
    }));
  };

  // Handle cosmetic type selection
  const handleCosmeticTypeSelect = (value: string) => {
    setActiveCosmeticType(value);
    setPendingFilters(true);
    setShowCosmeticTypeDropdown(false);
  };

  // Toggle cosmetic dropdown
  const toggleCosmeticDropdown = (cosmeticType: string) => {
    setActiveDropdown(activeDropdown === cosmeticType ? null : cosmeticType);
  };

  // Handle filter selection
  const handleFilterSelect = (cosmeticType: string, filter: string) => {
    setSelectedFilters(prev => {
      const currentFilters = [...prev[cosmeticType as keyof typeof prev]];
      
      if (currentFilters.includes(filter)) {
        return {
          ...prev,
          [cosmeticType]: currentFilters.filter(f => f !== filter)
        };
      } else {
        return {
          ...prev,
          [cosmeticType]: [...currentFilters, filter]
        };
      }
    });
    setPendingFilters(true);
  };
  
  // Update the rarity selection handler
  const handleRaritySelect = (rarity: string) => {
    setSelectedRarity(rarity === selectedRarity ? '' : rarity);
    setPendingFilters(true);
  };

  // Apply all filters when button is clicked
  const applyFilters = () => {
    // Save current filter state
    const newFilterState = {
      searchQuery: searchQuery,
      minPrice: minPrice,
      maxPrice: maxPrice,
      platform: platform,
      selectedCategories: selectedCategories,
      selectedCosmetics: selectedCosmetics,
      activeCosmeticType: activeCosmeticType,
      selectedRarity: selectedRarity
    };
    
    // Update filter state
    setFilterState(newFilterState);
    
    // Reset pending filters flag
    setPendingFilters(false);
  };

  // Create a memoized filters object that updates ONLY when Apply is clicked
  const filters = useMemo(() => {
    const filterObj = {
      search: filterState.searchQuery,
      minPrice: parseInt(filterState.minPrice) || 0,
      maxPrice: parseInt(filterState.maxPrice) || 10000,
      platform: filterState.platform !== 'all' ? filterState.platform : undefined,
      categories: filterState.selectedCategories.length > 0 ? filterState.selectedCategories : undefined,
      cosmetics: filterState.selectedCosmetics.length > 0 ? filterState.selectedCosmetics : undefined,
      cosmeticType: filterState.activeCosmeticType || undefined,
      rarity: filterState.selectedRarity || undefined
    };
    console.log('Applied filter object:', filterObj);
    return filterObj;
  }, [filterState]);

  // Fetch products with filters - only happens when filters are applied
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  });

  // Filter cosmetics based on search and type
  const filteredCosmetics = useMemo(() => {
    if (!cosmetics) return [];
    
    const searchLower = cosmeticSearch.toLowerCase().trim();
    
    return (cosmetics as CosmeticItem[]).filter((cosmetic: CosmeticItem) => {
      // Filter by search term if present
      if (searchLower) {
        // Check name match
        const nameMatch = cosmetic.name && 
          typeof cosmetic.name === 'string' && 
          cosmetic.name.toLowerCase().includes(searchLower);

        // Check ID match
        const idMatch = cosmetic.id &&
          typeof cosmetic.id === 'string' &&
          cosmetic.id.toLowerCase().includes(searchLower);

        // Check type match
        const typeMatch = cosmetic.type &&
          typeof cosmetic.type === 'string' &&
          cosmetic.type.toLowerCase().includes(searchLower);

        if (!nameMatch && !idMatch && !typeMatch) return false;
      }
      
      // Filter by active cosmetic type if selected
      if (activeCosmeticType) {
        return cosmetic.type?.toLowerCase() === activeCosmeticType.toLowerCase() || 
          (!cosmetic.type && activeCosmeticType === 'outfits');
      }
      
      return true;
    });
  }, [cosmetics, cosmeticSearch, activeCosmeticType]);

  // Helper function to safely convert value to string and lowercase
  const safeToLowerCase = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  };

  // Update the getFilteredCosmeticOptions function with safe string handling
  const getFilteredCosmeticOptions = (type: { value: CosmeticTypeKey; label: string; filters: string[] }) => {
    if (!cosmetics) return [];

    const searchLower = safeToLowerCase(cosmeticSearch);
    
    // If there's a search query, search across all cosmetics first
    if (searchLower) {
      return (cosmetics as CosmeticItem[])
        .filter(cosmetic => {
          // Check name
          const nameMatch = safeToLowerCase(cosmetic.name).includes(searchLower);
          // Check ID
          const idMatch = safeToLowerCase(cosmetic.id).includes(searchLower);
          // Check type
          const typeMatch = safeToLowerCase(cosmetic.type).includes(searchLower);
          // Check rarity
          const rarityMatch = safeToLowerCase(cosmetic.rarity).includes(searchLower);
          
          return nameMatch || idMatch || typeMatch || rarityMatch;
        })
        .sort((a, b) => {
          // Prioritize exact matches
          const aExact = safeToLowerCase(a.name) === searchLower;
          const bExact = safeToLowerCase(b.name) === searchLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          // Then prioritize matches by type
          const aTypeMatch = safeToLowerCase(a.type) === safeToLowerCase(type.value);
          const bTypeMatch = safeToLowerCase(b.type) === safeToLowerCase(type.value);
          if (aTypeMatch && !bTypeMatch) return -1;
          if (!aTypeMatch && bTypeMatch) return 1;
          
          // Finally sort alphabetically
          return (a.name || '').localeCompare(b.name || '');
        })
        .slice(0, 20); // Show more results when searching
    }
    
    // If no search query, show only cosmetics of the selected type
    return (cosmetics as CosmeticItem[])
      .filter(cosmetic => 
        safeToLowerCase(cosmetic.type) === safeToLowerCase(type.value) || 
        (!cosmetic.type && type.value === 'outfits')
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .slice(0, 10);
  };

  // Update the renderCosmeticDropdownContent function to show better search results
  const renderCosmeticDropdownContent = (type: { value: CosmeticTypeKey; label: string; filters: string[] }) => {
    const filteredOptions = searchResults || [];
    const hasSearchResults = filteredOptions.length > 0;

    return (
      <div className="p-3">
        <div className="mb-3">
          <Input
            placeholder={cosmeticSearch ? "Search all cosmetics..." : `Search ${type.label.toLowerCase()}...`}
            className="bg-slate-900/50 border-slate-700"
            value={cosmeticSearch}
            onChange={(e) => setCosmeticSearch(e.target.value)}
          />
        </div>

        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : hasSearchResults ? (
            filteredOptions.map((cosmetic: FortniteCosmetic) => (
              <div
                key={cosmetic.id}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-slate-700 ${
                  selectedCosmetics.includes(cosmetic.name) ? 'bg-blue-900/30' : ''
                }`}
                onClick={() => handleCosmeticSelect(cosmetic)}
              >
                <Checkbox
                  checked={selectedCosmetics.includes(cosmetic.name)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  onCheckedChange={() => handleCosmeticSelect(cosmetic)}
                />
                <div className="flex items-center gap-2 flex-1">
                  {cosmetic.images.smallIcon && (
                    <Image
                      src={cosmetic.images.smallIcon}
                      alt={cosmetic.name}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                  )}
                  <span className="text-sm">{cosmetic.name}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`ml-auto text-xs ${
                    rarityOptions.find(r => r.value === cosmetic.rarity.value.toLowerCase())?.color || ''
                  }`}
                >
                  {cosmetic.rarity.displayValue}
                </Badge>
              </div>
            ))
          ) : (
            cosmeticSearch ? (
              <div className="text-center py-2 text-slate-500 text-sm">
                No cosmetics found matching "{cosmeticSearch}"
              </div>
            ) : (
              type.filters.map((name) => (
                <div
                  key={name}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-slate-700 ${
                    selectedCosmetics.includes(name) ? 'bg-blue-900/30' : ''
                  }`}
                  onClick={() => handleQuickFilterSelect(name)}
                >
                  <Checkbox
                    checked={selectedCosmetics.includes(name)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    onCheckedChange={() => handleQuickFilterSelect(name)}
                  />
                  <span className="text-sm">{name}</span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    );
  };

  // Update the matchesCosmeticSearch function with safe string handling
  const matchesCosmeticSearch = (cosmetic: CosmeticItem | undefined, searchQuery: string): boolean => {
    if (!cosmetic || !searchQuery) return false;
    const searchLower = safeToLowerCase(searchQuery);
    
    // Split search query into words for better matching
    const searchWords = searchLower.split(/\s+/);
    
    // Check if ALL search words match any of the cosmetic fields
    return searchWords.every(word => (
      // Check name
      safeToLowerCase(cosmetic.name).includes(word) ||
      // Check ID
      safeToLowerCase(cosmetic.id).includes(word) ||
      // Check type
      safeToLowerCase(cosmetic.type).includes(word) ||
      // Check rarity
      safeToLowerCase(cosmetic.rarity).includes(word)
    ));
  };

  // Update the productHasCosmetic function with safe string handling
  const productHasCosmetic = (product: Product, searchName: string): boolean => {
    if (!product || !searchName) return false;
    const searchLower = safeToLowerCase(searchName);

    // Check in the product name
    if (safeToLowerCase(product.name).includes(searchLower)) return true;

    // Check in the cosmetics array
    if (product.cosmetics?.some(c => safeToLowerCase(c).includes(searchLower))) return true;

    // Check in athena_ids mapped to cosmetic names
    if (product.athena_ids && cosmetics) {
      return product.athena_ids.some(id => {
        const cosmetic = (cosmetics as CosmeticItem[])?.find(c => {
          const cosmeticId = safeToLowerCase(c.id);
          const searchId = safeToLowerCase(id);
          return cosmeticId === searchId || 
                 cosmeticId === searchId.trim() || 
                 cosmeticId.includes(searchId) || 
                 searchId.includes(cosmeticId);
        });
        return safeToLowerCase(cosmetic?.name).includes(searchLower);
      });
    }

    return false;
  };

  // Update the products filtering logic with proper typing
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filter by platform - using normalized platform names and checking both fields
      if (filterState.platform !== 'all') {
        if (!productSupportsPlatform(product, filterState.platform)) {
          return false;
        }
      }
      
      // Filter by price range
      const price = parseFloat(product.price.toString());
      const min = parseFloat(filterState.minPrice) || 0;
      const max = parseFloat(filterState.maxPrice) || 10000;
      if (price < min || price > max) {
        return false;
      }

      // Filter by rarity if selected
      if (selectedRarity && product.athena_ids) {
        // Get all cosmetics for this product
        const hasMatchingRarity = product.athena_ids.some(id => {
          const cosmetic = (cosmetics as CosmeticItem[])?.find((c: CosmeticItem) => {
            const cosmeticId = String(c.id || '').toLowerCase();
            const searchId = String(id || '').toLowerCase();
            return cosmeticId === searchId || 
                   cosmeticId === searchId.trim() || 
                   cosmeticId.includes(searchId) || 
                   searchId.includes(cosmeticId);
          });
          return cosmetic?.rarity?.toLowerCase() === selectedRarity.toLowerCase();
        });

        if (!hasMatchingRarity) {
          return false;
        }
      }

      // Filter by selected cosmetics - check if ALL selected cosmetics are present
      if (selectedCosmetics.length > 0) {
        const hasAllSelectedCosmetics = selectedCosmetics.every(selectedName =>
          productHasCosmetic(product, selectedName)
        );

        if (!hasAllSelectedCosmetics) {
          return false;
        }
      }
      
      return true;
    });
  }, [products, filterState, selectedRarity, selectedCosmetics, cosmetics]);

  // Handle clearing all filters
  const handleClearFilters = () => {
    // Reset all filter states
    setSearchQuery('');
    setPriceRange([0, 10000]);
    setSelectedCategories([]);
    setPlatform('all');
    setMinPrice('0');
    setMaxPrice('10000');
    setSelectedCosmetics([]);
    setActiveCosmeticType(null);
    setSelectedRarity(null);
    setCosmeticSearch('');
    setSelectedFilters({
      outfits: [],
      pickaxes: [],
      emotes: [],
      gliders: [],
      backblings: []
    });
    
    // Immediately reset filter state to default values
    setFilterState({
      searchQuery: '',
      minPrice: '0',
      maxPrice: '10000',
      platform: 'all',
      selectedCategories: [],
      selectedCosmetics: [],
      activeCosmeticType: null,
      selectedRarity: null
    });
    
    // Reset pending filters flag
    setPendingFilters(false);
  };

  // Update the cosmetic name handling in the product card
  const getDisplayName = (id: string, cosmetics: CosmeticItem[] | undefined) => {
    // Handle null or undefined IDs
    if (!id) return 'Unknown Item';
    
    // Remove any surrounding quotes and trim whitespace
    let cleanId = id.replace(/^["'](.+)["']$/, '$1').trim();
    
    // Remove any extra spaces between words
    cleanId = cleanId.replace(/\s+/g, ' ');
    
    // First try to find the cosmetic in our API data
    const cosmeticItem = cosmetics?.find((c: CosmeticItem) => 
      c.id === cleanId || c.id === id
    );
    
    if (cosmeticItem?.name) {
      return cosmeticItem.name;
    }

    // Convert to lowercase for consistent matching
    cleanId = cleanId.toLowerCase();
    
    // Handle malformed IDs with extra spaces or quotes
    if (cleanId.includes('cid')) {
      cleanId = cleanId
        .replace(/^"cid/i, 'cid')
        .replace(/cid"\s*/i, 'cid_')
        .replace(/\s+(\d+)\s+/g, '_$1_');
    }
    
    // Handle special cases
    const specialCases: Record<string, string> = {
      'cid_029': 'Black Knight',
      'cid_028': 'Renegade Raider',
      'cid_175_athena_commando_m_celestial': 'Galaxy',
      'cid_313_athena_commando_m_kpop': 'IKONIK',
      'cid_479_athena_commando_f_davinci': 'Wonder',
      'cid_051_athena_commando_m_holidayelf': 'Codename E.L.F.',
      'cid_030_athena_commando_m_halloween': 'Skull Trooper',
      'cid_032_athena_commando_m_medieval': 'Blue Squire',
      'cid_371_athena_commando_m_speedymidnight': 'Midnight Ops',
      'pickaxe_id_015_holidaycandycane': 'Candy Axe',
      'glider_id_008': 'Mako',
      'eid_floss': 'Floss',
      'eid_worm': 'The Worm',
      'eid_wave': 'Wave',
      'eid_ride_the_pony': 'Ride the Pony',
      'eid_dab': 'Dab',
      'pickaxe_lockjaw': 'Raiders Revenge',
      'pickaxe_acdc': 'AC/DC',
      'pickaxe_deathvalley': 'Death Valley',
      'bid_004_blackknight': 'Black Shield',
      'bid_023_cupid': 'Love Wings'
    };
    
    // Check for special cases using includes() to be more forgiving with malformed IDs
    for (const [key, value] of Object.entries(specialCases)) {
      if (cleanId.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // If no special case matches, try to clean up the ID
    try {
      const parts = cleanId
        .replace(/^["'](.+)["']$/, '$1') // Remove any remaining quotes
        .replace(/^cid\s*_?\s*\d+\s*_?/i, '') // Remove CID prefix with more flexible spacing
        .replace(/^bid\s*_?\s*\d+\s*_?/i, '') // Remove BID prefix
        .replace(/^eid\s*_?/i, '') // Remove EID prefix
        .replace(/^pickaxe\s*_?/i, '') // Remove pickaxe prefix
        .replace(/^glider\s*_?/i, '') // Remove glider prefix
        .replace(/athena\s*_?commando\s*_?[fm]\s*_?/i, '') // Remove Athena Commando prefix
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      
      if (parts.length > 0) {
        const name = parts.join(' ');
        // Check if the result looks reasonable (not just numbers or single letters)
        if (name.length > 1 && !/^\d+$/.test(name) && !/^[A-Z]$/.test(name)) {
          return name;
        }
      }
    } catch (error) {
      console.error('Error parsing cosmetic ID:', error);
    }
    
    // If we can't parse a meaningful name, return a generic one based on type
    if (cleanId.includes('cid')) return 'Outfit';
    if (cleanId.includes('bid')) return 'Back Bling';
    if (cleanId.includes('eid')) return 'Emote';
    if (cleanId.includes('pickaxe')) return 'Pickaxe';
    if (cleanId.includes('glider')) return 'Glider';
    
    return 'Cosmetic Item';
  };

  // Update the quick filter selection handler
  const handleQuickFilterSelect = (tag: string) => {
    // If the tag is already selected, remove it
    if (selectedCosmetics.includes(tag)) {
      setSelectedCosmetics(prev => prev.filter(name => name !== tag));
    } else {
      // Add the tag to selected cosmetics
      setSelectedCosmetics(prev => [...prev, tag]);
    }
    
    setPendingFilters(true);
  };

  // Update the handleCosmeticSelect function to handle both CosmeticItem and FortniteCosmetic
  const handleCosmeticSelect = (cosmetic: CosmeticItem | FortniteCosmetic) => {
    const cosmeticName = 'name' in cosmetic ? cosmetic.name : '';
    
    // Update selectedCosmetics
    setSelectedCosmetics(prev => {
      const isSelected = prev.includes(cosmeticName);
      if (isSelected) {
        return prev.filter(name => name !== cosmeticName);
      } else {
        return [...prev, cosmeticName];
      }
    });

    // Update selectedFilters for the active cosmetic type
    if (activeCosmeticType) {
      setSelectedFilters(prev => {
        const currentFilters = [...prev[activeCosmeticType as keyof typeof prev]];
        const isSelected = currentFilters.includes(cosmeticName);
        
        return {
          ...prev,
          [activeCosmeticType]: isSelected
            ? currentFilters.filter(name => name !== cosmeticName)
            : [...currentFilters, cosmeticName]
        };
      });
    }
    
    setPendingFilters(true);
  };

  // Update price range when min/max inputs change
  useEffect(() => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || 10000;
    if (min >= 0 && max > min) {
      setPriceRange([min, max]);
    }
    setPendingFilters(true);
  }, [minPrice, maxPrice, setPriceRange]);

  // Update cosmetic search to use Fortnite API
  useEffect(() => {
    if (cosmeticSearch) {
      setFortniteSearch(cosmeticSearch);
    }
  }, [cosmeticSearch, setFortniteSearch]);

  const handleViewDetails = (productId: string) => {
    router.push(`/marketplace/${productId}`);
  };

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">Error loading products. Please try again later.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Browse Marketplace</h1>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
              <div className="flex flex-wrap gap-2 flex-1">
                {/* Device Dropdown */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="bg-slate-900 border-slate-700 w-[180px] justify-between"
                    onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                  >
                    <span>{platform === 'all' ? 'Device' : platform}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDeviceDropdown ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showDeviceDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-md shadow-lg">
                      <div className="py-1 max-h-60 overflow-auto">
                        {deviceOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-800 ${platform === option.value ? 'bg-slate-800' : ''}`}
                            onClick={() => handleDeviceSelect(option.value)}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Rarity Dropdown */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="bg-slate-900 border-slate-700 w-[180px] justify-between"
                    onClick={() => setShowRarityDropdown(!showRarityDropdown)}
                  >
                    <span>
                      {selectedRarity ? (
                        <span className={rarityOptions.find(r => r.value === selectedRarity?.toLowerCase())?.color || ''}>
                            {selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1)}
                        </span>
                      ) : 'Rarity'}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showRarityDropdown ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showRarityDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-md shadow-lg">
                      <div className="py-1 max-h-60 overflow-auto">
                        {rarityOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-800 ${
                              selectedRarity?.toLowerCase() === option.value ? 'bg-slate-800' : ''
                            }`}
                            onClick={() => handleRaritySelect(option.value)}
                          >
                            <span className={option.color}>{option.label}</span>
                            {cosmeticsByRarity[option.value] && (
                              <span className="ml-2 text-xs opacity-60">
                                ({cosmeticsByRarity[option.value]?.length || 0})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Price Range Input */}
                <div className="flex items-center space-x-2">
                  <div className="relative w-[100px]">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="pl-7 w-full bg-slate-900 border-slate-700"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="relative w-[100px]">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="pl-7 w-full bg-slate-900 border-slate-700"
                    />
                  </div>
                </div>
                
                {/* Apply Filter Button */}
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={applyFilters}
                  className={`${pendingFilters ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  Apply Filter
                  {pendingFilters && <span className="ml-1 text-xs">•</span>}
                </Button>
                
                {/* Clear Filters Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear filters
                </Button>
              </div>
              
              {/* View Mode Buttons */}
              <div className="flex space-x-1">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="bg-slate-800 border-slate-700 h-9 w-9"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="bg-slate-800 border-slate-700 h-9 w-9"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Cosmetic Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {cosmeticTypeOptions.map(type => (
                <div key={type.value} className="relative">
                  <Button
                    variant={activeCosmeticType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      handleCosmeticTypeSelect(type.value);
                      toggleCosmeticDropdown(type.value);
                    }}
                    className={`
                      relative z-10 px-6 py-2 rounded-md transition-all duration-200
                      ${activeCosmeticType === type.value 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'}
                      ${selectedFilters[type.value as keyof typeof selectedFilters].length > 0 ? 'ring-2 ring-blue-500/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {type.label}
                      {selectedFilters[type.value as keyof typeof selectedFilters].length > 0 && (
                        <Badge className="bg-blue-500/30 text-blue-200 text-xs px-1.5">
                          {selectedFilters[type.value as keyof typeof selectedFilters].length}
                        </Badge>
                      )}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeDropdown === type.value ? 'rotate-180' : ''}`} />
                    </div>
                  </Button>
                  
                  {/* Dropdown for additional filters */}
                  {activeDropdown === type.value && (
                    <div className="absolute left-0 z-20 mt-1 w-60 bg-slate-800 rounded-md border border-slate-700 shadow-xl animate-in fade-in-10 zoom-in-95">
                      {renderCosmeticDropdownContent(type)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Selected Cosmetic Tags */}
            {selectedCosmetics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCosmetics.map(cosmeticName => {
                  // Find the cosmetic in our data if possible
                  const foundCosmetic = cosmetics?.find((c: CosmeticItem) => c.name === cosmeticName);
                  return (
                    <Badge 
                      key={cosmeticName} 
                      className="bg-blue-500/20 text-blue-400 flex items-center gap-1 pl-2 pr-1 py-1"
                    >
                      {foundCosmetic?.name || cosmeticName}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 ml-1 text-blue-400 hover:text-white hover:bg-transparent"
                        onClick={() => {
                          const tempCosmetic: CosmeticItem = { 
                            id: foundCosmetic?.id || cosmeticName, 
                            name: cosmeticName 
                          };
                          handleCosmeticSelect(tempCosmetic);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-gray-400 hover:text-white"
                  onClick={() => setSelectedCosmetics([])}
                >
                  Clear All
                </Button>
              </div>
            )}
            
            {/* Popular Cosmetic Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['Renegade Raider', 'Travis Scott', 'Black Knight', 'Omega', 
                'IKONIK', 'Galaxy', 'Wonder', 'Reaper', 'Mako', 'Glow', 
                'Sparkle Specialist', 'Peely', 'Skull Trooper', 'Ghoul Trooper',
                'Wildcat', 'Aerial Assault Trooper', 'Recon Expert', 'The Paradigm',
                'Drift', 'Lynx', 'Calamity'].map(tag => (
                <Badge 
                  key={tag}
                  variant="outline"
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCosmetics.includes(tag) 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-blue-400/50'
                  }`}
                  onClick={() => handleQuickFilterSelect(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Products Grid or List */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {filteredProducts.map((product) => (
                  <AccountCard
                    key={product.id}
                    id={parseInt(product.id)}
                    name={product.name}
                    price={product.price}
                    skins={product.athena_ids || []}
                    backpacks={product.stats?.backpacks || 0}
                    level={product.stats?.level || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}