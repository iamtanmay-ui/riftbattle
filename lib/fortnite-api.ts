import axios, { AxiosInstance } from 'axios';

// Types for Fortnite API responses
export interface FortniteCosmetic {
    id: string;
    name: string;
    description: string;
    type: {
        value: string;
        displayValue: string;
    };
    rarity: {
        value: string;
        displayValue: string;
    };
    series?: {
        value: string;
        image?: string;
        backendValue: string;
    };
    images: {
        smallIcon: string;
        icon: string;
        featured?: string;
    };
    introduction?: {
        chapter?: string;
        season?: string;
        text: string;
    };
    added: string;
}

export interface FortniteAccount {
    id: string;
    displayName: string;
    level: number;
    cosmetics: {
        outfits: FortniteCosmetic[];
        backblings: FortniteCosmetic[];
        pickaxes: FortniteCosmetic[];
        gliders: FortniteCosmetic[];
        emotes: FortniteCosmetic[];
    };
    stats: {
        outfitCount: number;
        backblingCount: number;
        pickaxeCount: number;
        gliderCount: number;
        emoteCount: number;
        vbucks?: number;
    };
}

// Create Fortnite API client
class FortniteAPIClient {
    private apiKey: string;
    private baseURL: string;
    private client: AxiosInstance;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseURL = 'https://fortnite-api.com/v2';
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': this.apiKey
            }
        });
    }

    // Fetch cosmetic by ID
    async getCosmeticById(id: string): Promise<FortniteCosmetic | null> {
        try {
            const response = await this.client.get(`/cosmetics/br/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching cosmetic:', error);
            return null;
        }
    }

    // Fetch multiple cosmetics by IDs
    async getCosmeticsByIds(ids: string[]): Promise<FortniteCosmetic[]> {
        try {
            const promises = ids.map(id => this.getCosmeticById(id));
            const results = await Promise.all(promises);
            return results.filter((item): item is FortniteCosmetic => item !== null);
        } catch (error) {
            console.error('Error fetching cosmetics:', error);
            return [];
        }
    }

    // Search cosmetics
    async searchCosmetics(query: string, type?: string): Promise<FortniteCosmetic[]> {
        try {
            const params: Record<string, string> = { name: query };
            if (type) {
                params.type = type;
            }

            const response = await this.client.get('/cosmetics/br/search', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error searching cosmetics:', error);
            return [];
        }
    }

    // Transform Fortnite cosmetics to our app's format
    transformCosmeticToAppFormat(cosmetic: FortniteCosmetic) {
        return {
            id: cosmetic.id,
            name: cosmetic.name,
            description: cosmetic.description,
            type: cosmetic.type.value.toLowerCase(),
            rarity: cosmetic.rarity.value.toLowerCase(),
            image: cosmetic.images.icon,
            series: cosmetic.series?.value,
            introduction: cosmetic.introduction
        };
    }

    // Get account cosmetics (mock implementation - in real app would call actual Fortnite API)
    async getAccountCosmetics(athenaIds: string[]): Promise<FortniteAccount> {
        const cosmetics = await this.getCosmeticsByIds(athenaIds);
        
        const categorizedCosmetics = {
            outfits: [] as FortniteCosmetic[],
            backblings: [] as FortniteCosmetic[],
            pickaxes: [] as FortniteCosmetic[],
            gliders: [] as FortniteCosmetic[],
            emotes: [] as FortniteCosmetic[]
        };

        cosmetics.forEach(cosmetic => {
            const type = cosmetic.type.value.toLowerCase();
            if (type.includes('outfit')) categorizedCosmetics.outfits.push(cosmetic);
            else if (type.includes('backpack')) categorizedCosmetics.backblings.push(cosmetic);
            else if (type.includes('pickaxe')) categorizedCosmetics.pickaxes.push(cosmetic);
            else if (type.includes('glider')) categorizedCosmetics.gliders.push(cosmetic);
            else if (type.includes('emote')) categorizedCosmetics.emotes.push(cosmetic);
        });

        return {
            id: 'account-id', // Would come from actual API
            displayName: 'Account Name', // Would come from actual API
            level: 100, // Would come from actual API
            cosmetics: categorizedCosmetics,
            stats: {
                outfitCount: categorizedCosmetics.outfits.length,
                backblingCount: categorizedCosmetics.backblings.length,
                pickaxeCount: categorizedCosmetics.pickaxes.length,
                gliderCount: categorizedCosmetics.gliders.length,
                emoteCount: categorizedCosmetics.emotes.length,
                vbucks: 0 // Would come from actual API
            }
        };
    }
}

// Create and export singleton instance
export const fortniteAPI = new FortniteAPIClient(process.env.NEXT_PUBLIC_FORTNITE_API_KEY || ''); 