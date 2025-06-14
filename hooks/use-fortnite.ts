import { useState, useCallback } from 'react';
import { fortniteAPI, FortniteCosmetic, FortniteAccount } from '@/lib/fortnite-api';
import { useQuery } from '@tanstack/react-query';

export function useFortnite() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | undefined>();

    // Search cosmetics with caching
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['fortnite-search', searchQuery, selectedType],
        queryFn: () => fortniteAPI.searchCosmetics(searchQuery, selectedType),
        enabled: searchQuery.length > 0,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Get account cosmetics with caching
    const getAccountCosmetics = useCallback(async (athenaIds: string[]) => {
        return fortniteAPI.getAccountCosmetics(athenaIds);
    }, []);

    // Get single cosmetic by ID with caching
    const getCosmeticById = useCallback(async (id: string) => {
        return fortniteAPI.getCosmeticById(id);
    }, []);

    // Transform cosmetic to app format
    const transformCosmetic = useCallback((cosmetic: FortniteCosmetic) => {
        return fortniteAPI.transformCosmeticToAppFormat(cosmetic);
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        selectedType,
        setSelectedType,
        searchResults,
        isSearching,
        getAccountCosmetics,
        getCosmeticById,
        transformCosmetic
    };
} 