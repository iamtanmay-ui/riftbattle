import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useFortnite } from '@/hooks/use-fortnite';
import { FortniteCosmetic } from '@/lib/fortnite-api';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Sparkles, GamepadIcon } from 'lucide-react';
import Image from 'next/image';

interface AccountCardProps {
    id: number;
    name: string;
    price: number;
    skins: string[];
    backpacks?: number;
    level?: number;
    vbucks?: number;
    platform?: string;
}

export function AccountCard({
    id,
    name,
    price,
    skins,
    backpacks = 0,
    level = 0,
    vbucks = 0,
    platform = 'PC'
}: AccountCardProps) {
    const router = useRouter();
    const { getAccountCosmetics } = useFortnite();
    const [accountData, setAccountData] = useState<{
        outfits: FortniteCosmetic[];
        rareOutfits: FortniteCosmetic[];
        loading: boolean;
    }>({
        outfits: [],
        rareOutfits: [],
        loading: true
    });

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const data = await getAccountCosmetics(skins);
                const rareOutfits = data.cosmetics.outfits.filter(outfit => 
                    outfit.rarity.value.toLowerCase() === 'legendary' || 
                    outfit.rarity.value.toLowerCase() === 'epic'
                );

                setAccountData({
                    outfits: data.cosmetics.outfits,
                    rareOutfits,
                    loading: false
                });
            } catch (error) {
                console.error('Error fetching account data:', error);
                setAccountData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchAccountData();
    }, [skins, getAccountCosmetics]);

    const handleViewDetails = () => {
        router.push(`/marketplace/${id}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    if (accountData.loading) {
        return (
            <Card className="w-full bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-colors">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{name}</span>
                    <Badge variant="outline" className="ml-2">
                        {platform}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                            <div className="font-semibold">{accountData.outfits.length}</div>
                            <div className="text-gray-400">Outfits</div>
                        </div>
                        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                            <div className="font-semibold">{level}</div>
                            <div className="text-gray-400">Level</div>
                        </div>
                        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                            <div className="font-semibold">{vbucks}</div>
                            <div className="text-gray-400">V-Bucks</div>
                        </div>
                    </div>

                    {/* Rare Outfits */}
                    {accountData.rareOutfits.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                                <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                                Rare Outfits
                            </h4>
                            <ScrollArea className="h-20">
                                <div className="flex flex-wrap gap-2">
                                    {accountData.rareOutfits.map((outfit) => (
                                        <Badge
                                            key={outfit.id}
                                            variant="outline"
                                            className={`
                                                ${outfit.rarity.value.toLowerCase() === 'legendary' ? 'text-yellow-400 border-yellow-400/50' : ''}
                                                ${outfit.rarity.value.toLowerCase() === 'epic' ? 'text-purple-400 border-purple-400/50' : ''}
                                            `}
                                        >
                                            {outfit.name}
                                        </Badge>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Account Features */}
                    <div className="flex flex-wrap gap-2">
                        {backpacks > 0 && (
                            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                                {backpacks} Back Blings
                            </Badge>
                        )}
                        {level >= 100 && (
                            <Badge variant="outline" className="text-green-400 border-green-400/50">
                                Max Level
                            </Badge>
                        )}
                        {vbucks > 0 && (
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                                {vbucks} V-Bucks
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="text-lg font-bold">{formatPrice(price)}</div>
                <Button onClick={handleViewDetails} className="bg-blue-600 hover:bg-blue-700">
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
} 