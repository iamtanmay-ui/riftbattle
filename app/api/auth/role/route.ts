import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/lib/auth';

export async function GET() {
  try {
    console.log('Verifying user role...');
    
    // Get authentication headers
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      console.error('Missing authentication headers');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the role from the backend
    const response = await api.get('/get_role', { headers: authHeaders });
    console.log('Role verification response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });

    return NextResponse.json({ role: response.data });

  } catch (error: any) {
    console.error('Error verifying role:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify role' },
      { status: error.response?.status || 500 }
    );
  }
}