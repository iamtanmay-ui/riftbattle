import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riftbattle.com';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const cookieStore = cookies();
  const session = cookieStore.get('session');
  const authToken = cookieStore.get('auth_token');

  console.log('Available cookies:', cookieStore.getAll().map(cookie => ({
    name: cookie.name,
    value: !!cookie.value
  })));

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

  console.log('Generated auth headers:', {
    hasCookie: !!session,
    hasAuth: !!authToken,
    headers: headers
  });

  return headers;
};

export async function POST(request: Request) {
  try {
    console.log('Starting check-auth request');
    const headers = getAuthHeaders();

    if (!headers['Authorization'] || !headers['Cookie']) {
      console.error('Missing required authentication headers');
      return NextResponse.json(
        { error: 'Missing authentication credentials' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { device_code } = body;

    if (!device_code) {
      return NextResponse.json(
        { error: 'Missing device_code' },
        { status: 400 }
      );
    }

    console.log('Checking Epic Games authentication status...');
    const fullUrl = `${API_BASE_URL}/api/check_auth`;
    console.log('Calling API endpoint:', fullUrl);
    
    const response = await axios.post(fullUrl, 
      { device_code },
      { 
        headers,
        validateStatus: (status) => status === 200 || status === 202
      }
    );

    console.log('API Response:', response.data);

    // If status is 202, authentication is still pending
    if (response.status === 202) {
      return NextResponse.json({ status: 'pending' });
    }

    // If we get here, authentication is complete
    return NextResponse.json({ 
      status: 'completed',
      device_code // Return the device code so it can be used for get_skins
    });

  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });

    return NextResponse.json(
      { 
        error: error.message || 'Failed to check Epic Games authentication',
        status: error.response?.status || 500,
        data: error.response?.data,
        headers: error.config?.headers
      },
      { status: error.response?.status || 500 }
    );
  }
} 