import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.riftbattle.com";

export async function GET() {
  try {
    // Get both session and auth token cookies
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    if (!sessionCookie || !authToken) {
      console.log('Missing authentication cookies');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Making request to get Fortnite link');

    // Make request to backend API with both session and auth token
    const response = await axios.get(
      `${API_BASE_URL}/get_link`,
      {
        headers: {
          'Cookie': `session=${sessionCookie}`,
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log('Backend API response:', {
      status: response.status,
      statusText: response.statusText
    });

    // According to swagger, we expect user_code, device_code, and verification_uri
    const data = response.data;
    if (!data.user_code || !data.device_code || !data.verification_uri) {
      console.error('Invalid response format from API:', data);
      return NextResponse.json(
        { error: 'Invalid response format from server' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error getting Fortnite link:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Forward the error from the backend if available
    if (error.response?.data) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get Fortnite authentication link' },
      { status: 500 }
    );
  }
} 