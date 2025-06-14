import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riftbattle.com';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_athena_ids`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch athena IDs');
    }

    const data = await response.json();

    // Create response with proper CORS headers
    const corsResponse = NextResponse.json(data);
    corsResponse.headers.set('Access-Control-Allow-Origin', '*');
    corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return corsResponse;
  } catch (error) {
    console.error('Error fetching athena IDs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athena IDs' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const corsResponse = new NextResponse(null, { status: 204 });
  corsResponse.headers.set('Access-Control-Allow-Origin', '*');
  corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  corsResponse.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  return corsResponse;
} 