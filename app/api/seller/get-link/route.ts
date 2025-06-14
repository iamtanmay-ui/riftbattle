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

// Verify user role
const verifyRole = async (headers: Record<string, string>) => {
  console.log('Verifying user role...');
  try {
    const response = await axios.get(`${API_BASE_URL}/get_role`, { headers });
    console.log('Role verification response:', response);
    return response.data;
  } catch (error) {
    console.error('Role verification failed:', error);
    throw new Error('Failed to verify user role');
  }
};

export async function GET() {
  try {
    console.log('Starting get-link request');
    const headers = getAuthHeaders();

    if (!headers['Authorization'] || !headers['Cookie']) {
      console.error('Missing required authentication headers');
      return NextResponse.json(
        { error: 'Missing authentication credentials' },
        { status: 401 }
      );
    }

    // Verify user role first
    const role = await verifyRole(headers);
    console.log('User role:', role);

    if (role !== 'seller' && role !== 'admin') {
      console.error('Insufficient permissions. Role:', role);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.log('Getting Epic Games link...');
    const fullUrl = `${API_BASE_URL}/seller/get_link`;
    console.log('Calling API endpoint:', fullUrl);
    const response = await axios.get(fullUrl, { 
      headers,
      validateStatus: (status) => status === 200
    });

    console.log('API Response:', response.data);

    if (!response.data || !response.data.user_code || !response.data.verification_uri) {
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
        error: error.message || 'Failed to get Epic Games authentication link',
        status: error.response?.status || 500,
        data: error.response?.data,
        headers: error.config?.headers
      },
      { status: error.response?.status || 500 }
    );
  }
} 