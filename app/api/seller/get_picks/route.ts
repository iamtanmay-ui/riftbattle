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
    console.log('Starting get_picks request');
    const headers = getAuthHeaders();

    if (!headers['Authorization'] || !headers['Cookie']) {
      console.error('Missing required authentication headers');
      return NextResponse.json(
        { error: 'Missing authentication credentials' },
        { status: 401 }
      );
    }

    console.log('Fetching Epic Games account data...');
    const fullUrl = `${API_BASE_URL}/seller/get_picks`;
    console.log('Calling API endpoint:', fullUrl);
    
    const response = await axios.get(fullUrl, { 
      headers,
      validateStatus: (status) => status === 200
    });

    console.log('API Response:', response.data);

    if (!response.data || !response.data.id) {
      throw new Error('Invalid response format from API');
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });

    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch Epic Games account data',
        status: error.response?.status || 500,
        data: error.response?.data,
        headers: error.config?.headers
      },
      { status: error.response?.status || 500 }
    );
  }
} 