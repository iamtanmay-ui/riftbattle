import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riftbattle.com';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const cookieStore = cookies();
  const session = cookieStore.get('session');
  const authToken = cookieStore.get('auth_token');

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (session) {
    headers['Cookie'] = `session=${session.value}`;
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken.value}`;
  }

  return headers;
};

export async function GET(request: Request) {
  try {
    console.log('Starting get_products request');
    const headers = getAuthHeaders();
    console.log('Auth headers:', headers);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice') || '0';
    const maxPrice = searchParams.get('maxPrice') || '10000';
    const platform = searchParams.get('platform');
    const categories = searchParams.get('categories');
    const cosmetics = searchParams.get('cosmetics');
    const cosmeticType = searchParams.get('cosmeticType');
    const rarity = searchParams.get('rarity');

    // Build filter object
    const filter = {
      search,
      min_price: parseInt(minPrice),
      max_price: parseInt(maxPrice),
      platform,
      categories: categories ? categories.split(',') : undefined,
      cosmetics: cosmetics ? cosmetics.split(',') : undefined,
      cosmetic_type: cosmeticType,
      rarity
    };

    console.log('Applied filter object:', filter);

    // Make request to backend API
    try {
      console.log('Calling API endpoint:', `${API_BASE_URL}/get_products`);
      const response = await axios.get(
        `${API_BASE_URL}/get_products`,
        { 
          headers,
          params: filter,
          validateStatus: (status) => status === 200,
          timeout: 10000, // 10 second timeout
          withCredentials: false // Disable credentials in the request
        }
      );

      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);
      console.log('API Response data:', JSON.stringify(response.data, null, 2));

      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        return NextResponse.json(
          { error: 'Invalid response format from server' },
          { status: 500 }
        );
      }
      
      // Create response with proper CORS headers
      const corsResponse = NextResponse.json(response.data);
      corsResponse.headers.set('Access-Control-Allow-Origin', '*');
      corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return corsResponse;
    } catch (error: any) {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });

      // Handle different types of errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { 
            error: 'Unable to connect to the server. Please try again later.',
            status: 503,
            details: error.message
          },
          { status: 503 }
        );
      }

      if (error.response?.status === 502) {
        return NextResponse.json(
          { 
            error: 'Server is temporarily unavailable. Please try again later.',
            status: 502,
            details: error.message
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { 
          error: error.response?.data?.error || error.message || 'Failed to get products',
          status: error.response?.status || 500,
          data: error.response?.data
        },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return NextResponse.json(
      { 
        error: error.response?.data?.error || error.message || 'Failed to get products',
        status: error.response?.status || 500,
        data: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  const corsResponse = new NextResponse(null, { status: 204 });
  corsResponse.headers.set('Access-Control-Allow-Origin', '*');
  corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  corsResponse.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  return corsResponse;
} 