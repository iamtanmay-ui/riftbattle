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

export async function GET() {
  try {
    console.log('Starting verify-auth request');
    const headers = getAuthHeaders();

    if (!headers['Authorization'] || !headers['Cookie']) {
      console.error('Missing required authentication headers');
      return NextResponse.json(
        { error: 'Missing authentication credentials' },
        { status: 401 }
      );
    }

    console.log('Verifying Epic Games authentication...');
    const fullUrl = `${API_BASE_URL}/seller/verify_epic`;
    console.log('Calling API endpoint:', fullUrl);
    
    const response = await axios.get(fullUrl, { 
      headers,
      validateStatus: (status) => status === 200
    });

    console.log('API Response:', response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });

    // If the link is expired, return a specific error
    if (error.response?.data?.error === 'link expired') {
      return NextResponse.json(
        { error: 'link expired' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify Epic Games authentication',
        status: error.response?.status || 500,
        data: error.response?.data,
        headers: error.config?.headers
      },
      { status: error.response?.status || 500 }
    );
  }
} 