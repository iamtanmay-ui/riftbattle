import axios from "axios";

const api = axios.create({
    baseURL: "https://api.riftbattle.com",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        return Promise.reject(error);
    }
);

// Add request interceptor to handle authentication
api.interceptors.request.use(
    (config) => {
        // Get cookies from document if in browser
        if (typeof window !== 'undefined') {
            const cookies = document.cookie.split(';');
            const sessionCookie = cookies.find(c => c.trim().startsWith('session='));
            const authToken = cookies.find(c => c.trim().startsWith('auth_token='));
            
            if (sessionCookie) {
                config.headers['Cookie'] = sessionCookie.trim();
            }
            if (authToken) {
                const token = authToken.trim().split('=')[1];
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

export const sendOTP = async (email: string) => {
    // Use our new API route instead of the external API
    const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send verification code');
    }
    
    return response.json();
};

export const login = async (email: string, code: number) => {
    // Use our new API route instead of the external API
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Authentication failed');
    }
    
    return response.json();
};

export const getUser = async () => {
    try {
        const response = await api.get("/user/get_role");
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

export const getRole = async () => {
    try {
        const response = await api.get("/user/get_role");
        return response.data;
    } catch (error) {
        console.error("Error fetching role:", error);
        throw error;
    }
};

interface ProductFilters {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    platform?: string;
    categories?: string[];
    cosmetics?: string[];
}

export const getProducts = async (filters?: ProductFilters) => {
    try {
        // Build query parameters based on filters
        const params: Record<string, any> = {};
        
        if (filters) {
            if (filters.search) params.search = filters.search;
            if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
            if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
            if (filters.platform && filters.platform !== 'all') params.platform = filters.platform;
            
            // Add categories if provided
            if (filters.categories && filters.categories.length > 0) {
                params.categories = filters.categories.join(',');
            }
            
            // Add cosmetics (Athena IDs) if provided
            if (filters.cosmetics && filters.cosmetics.length > 0) {
                params.cosmetics = filters.cosmetics.join(',');
            }
        }
        
        console.log('API Request Params:', params);
        const response = await api.get("/get_products", { 
            params,
            withCredentials: false
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const getProduct = async (id: number) => {
    const response = await api.get("/get_product", { 
        params: { id },
        withCredentials: false
    });
    return response.data;
};

export const getSellerInfo = async (id: number) => {
    const response = await api.get("/get_seller_info", { params: { id } });
    return response.data;
};

export const getSeller = async (id: number) => {
    try {
        const response = await api.get(`/get_seller?id=${id}`, {
            withCredentials: false
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching seller:", error);
        return null;
    }
};

export const getAthenaIds = async () => {
    try {
        const response = await api.get('/get_athena_ids');
        return response.data;
    } catch (error) {
        console.error("Error fetching Athena IDs:", error);
        return [];
    }
};

// Get data for a specific skin by Athena ID
export const getSkinData = async (athenaId: string) => {
    try {
        const response = await api.get(`/get_skin`, {
            params: { athena_id: athenaId }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching skin data for ${athenaId}:`, error);
        return null;
    }
};

// Get icon URL for a specific skin by Athena ID
export const getSkinIconUrl = (athenaId: string) => {
    return `${api.defaults.baseURL}/icon?athena_id=${encodeURIComponent(athenaId)}`;
};

// Batch fetch multiple skin data
export const getBatchSkinData = async (athenaIds: string[]) => {
    try {
        // Use Promise.all to fetch multiple skins in parallel
        const promises = athenaIds.map(id => getSkinData(id));
        const results = await Promise.all(promises);
        return results.filter(Boolean); // Filter out any null results
    } catch (error) {
        console.error("Error batch fetching skin data:", error);
        return [];
    }
};

export const checkCoupon = async (coupon: string) => {
    const response = await api.get("/check_coupon", { params: { coupon } });
    return response.data;
};

// Export the api instance
export { api };
