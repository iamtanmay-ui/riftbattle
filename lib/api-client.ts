import axios from 'axios';
import { AuthStorage } from './auth-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riftbattle.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthStorage.getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API endpoints matching swagger specification
export const api = {
  // Auth endpoints
  auth: {
    sendOTP: async (email: string) => {
      const response = await apiClient.post('/send_otp', { email });
      return response.data;
    },

    login: async (email: string, code: number) => {
      const response = await apiClient.post('/login', { email, code });
      return response.data;
    },

    logout: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },

    getRole: async () => {
      const response = await apiClient.get('/get_role');
      return response.data;
    }
  },

  // Fortnite related endpoints
  fortnite: {
    getLink: async () => {
      const response = await apiClient.get('/get_link');
      return response.data;
    },

    getSkins: async (deviceCode: string) => {
      const response = await apiClient.get('/get_skins', {
        params: { device_code: deviceCode }
      });
      return response.data;
    },

    getSkinsInfo: async (athenaID: string) => {
      const response = await apiClient.get('/get_skins_info', {
        params: { athenaID }
      });
      return response.data;
    }
  },

  // Product related endpoints
  products: {
    getAll: async () => {
      const response = await apiClient.get('/get_products');
      return response.data;
    },

    getOne: async (id: number) => {
      const response = await apiClient.get('/get_product', {
        params: { id }
      });
      return response.data;
    },

    checkCoupon: async (coupon: string) => {
      const response = await apiClient.get('/check_coupon', {
        params: { coupon }
      });
      return response.data;
    }
  },

  // Order endpoints
  orders: {
    create: async (orderData: {
      email: string;
      product_id: number;
      payment_method: string;
      coupon?: string;
      warranty?: number;
    }) => {
      const response = await apiClient.post('/create_order', orderData);
      return response.data;
    }
  },

  // Seller endpoints
  seller: {
    getInfo: async (id: number) => {
      const response = await apiClient.get('/get_seller_info', {
        params: { id }
      });
      return response.data;
    },

    createProduct: async (productData: {
      name: string;
      price: number;
      athena_ids: string[];
      stats: Record<string, string>;
      active: boolean;
      description: string;
      discount?: number;
      credentials: string;
    }) => {
      const response = await apiClient.post('/seller/create_product', productData);
      return response.data;
    },

    editProduct: async (productData: {
      id: number;
      name?: string;
      price?: number;
      active?: boolean;
      description?: string;
      discount?: number;
    }) => {
      const response = await apiClient.put('/seller/edit_product', productData);
      return response.data;
    },

    addAthenaIds: async (athenaIds: string[]) => {
      const response = await apiClient.post('/seller/add_athena_ids', {
        athena_ids: athenaIds
      });
      return response.data;
    },

    getAthenaIds: async () => {
      const response = await apiClient.get('/seller/get_athena_ids');
      return response.data;
    },

    createCoupon: async (couponData: {
      name: string;
      discount: number;
      usages: number;
      expired_at: number;
    }) => {
      const response = await apiClient.post('/seller/create_coupon', couponData);
      return response.data;
    },

    deactivateCoupon: async (coupon: string) => {
      const response = await apiClient.put('/seller/deactivate_coupon', null, {
        params: { coupon }
      });
      return response.data;
    },

    editInfo: async (data: {
      seller_name: string;
      seller_avatar: string;
    }) => {
      const response = await apiClient.put('/seller/edit_seller_info', data);
      return response.data;
    },

    getProfits: async (days: number) => {
      const response = await apiClient.get('/seller/get_profits', {
        params: { days }
      });
      return response.data;
    }
  },

  // User endpoints
  user: {
    getUser: async () => {
      const response = await apiClient.get('/user/get_user');
      return response.data;
    },

    sendMessage: async (message: string, receiverId: number) => {
      const response = await apiClient.post('/user/send_message', {
        message,
        receiver_id: receiverId
      });
      return response.data;
    },

    getMessages: async (params?: {
      filter?: string;
      seller_id?: number;
      dateFrom?: number;
      dateTo?: number;
    }) => {
      const response = await apiClient.get('/user/get_messages', { params });
      return response.data;
    }
  }
}; 