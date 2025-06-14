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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Starting edit_product request for ID:', params.id);
    const headers = getAuthHeaders();

    if (!headers['Authorization'] || !headers['Cookie']) {
      console.error('Missing required authentication headers');
      return NextResponse.json(
        { error: 'Missing authentication credentials' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('Updating product with data:', body);

    // Validate required fields according to swagger spec
    if (!body.name || !body.price || !body.athena_ids || !body.stats || 
        !body.description || !body.credentials) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Make request to backend API
    try {
      console.log('Calling API endpoint:', `${API_BASE_URL}/seller/edit_product/${params.id}`);
      const response = await axios.put(
        `${API_BASE_URL}/seller/edit_product/${params.id}`,
        body,
        { 
          headers,
          validateStatus: (status) => status === 200,
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('API Response:', response.data);
      return NextResponse.json(response.data);
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
          error: error.response?.data?.error || error.message || 'Failed to update product',
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
        error: error.response?.data?.error || error.message || 'Failed to update product',
        status: error.response?.status || 500,
        data: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
} 