import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { useAuthStore } from '@/lib/store';

// Helper function to get auth from server-side
function getAuthFromCookies() {
  // This is a simple check for server-side auth
  // In a real app, you'd validate tokens or sessions
  const cookieStore = cookies();
  const authCookie = cookieStore.get('auth');
  
  if (!authCookie) {
    return { isAuthenticated: false, user: null };
  }
  
  try {
    return { isAuthenticated: true };
  } catch (error) {
    return { isAuthenticated: false, user: null };
  }
}

// GET /api/user/messages - Get messages
export async function GET(req: Request) {
  try {
    const { isAuthenticated } = getAuthFromCookies();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');
    const seller_id = searchParams.get('seller_id');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Create the query params
    const queryParams = new URLSearchParams();
    if (filter) queryParams.append('filter', filter);
    if (seller_id) queryParams.append('seller_id', seller_id);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const apiUrl = `${process.env.API_URL}/user/get_messages${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const messages = await response.json();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/user/messages - Send a message
export async function POST(req: Request) {
  try {
    const { isAuthenticated } = getAuthFromCookies();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, receiver_id } = await req.json();

    if (!message || !receiver_id) {
      return NextResponse.json(
        { error: 'Message and receiver_id are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.API_URL}/user/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, receiver_id }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 