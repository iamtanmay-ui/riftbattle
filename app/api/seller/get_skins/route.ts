import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riftbattle.com';

export async function GET(request: Request) {
  console.log('Starting get_skins request');
  
  try {
    // Get auth headers
    const cookieStore = await cookies();
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

    console.log('Auth headers:', {
      hasCookie: !!headers['Cookie'],
      hasAuth: !!headers['Authorization']
    });

    if (!headers['Authorization']) {
      console.error('Missing authorization token');
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    // Get device_code from query parameters
    const { searchParams } = new URL(request.url);
    const device_code = searchParams.get('device_code');

    if (!device_code) {
      console.error('Missing device_code parameter');
      return NextResponse.json(
        { error: 'device_code is required' },
        { status: 400 }
      );
    }

    // Call the Fortnite API
    console.log('Calling Fortnite API with device code:', device_code);
    const response = await axios.get(`${API_BASE_URL}/get_skins`, {
      params: { device_code },
      headers,
      validateStatus: (status) => status === 200,
      timeout: 10000 // 10 second timeout
    });

    console.log('Fortnite API response status:', response.status);
    
    if (!response.data) {
      throw new Error('Empty response from Fortnite API');
    }

    // Validate the response data
    const data = response.data;
    if (!Array.isArray(data.athena_ids)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Fortnite API');
    }

    // Transform and validate the response
    const transformedData = {
      athena_ids: data.athena_ids || [],
      skins_count: data.skins_count || 0,
      backpacks_count: data.backpacks_count || 0,
      emotes_count: data.emotes_count || 0,
      pickaxes_count: data.pickaxes_count || 0,
      glider_count: data.glider_count || 0,
      account_level: data.account_level || 0,
      suggested_name: data.suggested_name || ''
    };

    console.log('Transformed response:', transformedData);
    return NextResponse.json(transformedData);

  } catch (error: any) {
    console.error('Error in get_skins:', error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Fortnite account not found' },
        { status: 404 }
      );
    }

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { 
        error: error.response?.data?.error || error.message || 'Failed to fetch Fortnite data',
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
} 