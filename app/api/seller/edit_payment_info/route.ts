import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

// Define request body interface for payment settings
interface PaymentSettings {
  payment_method: string;
  payment_details: {
    [key: string]: string;
  };
}

export async function POST(request: Request) {
  try {
    // Get session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: PaymentSettings = await request.json();
    console.log('Received payment settings:', body);

    // Validate required fields
    if (!body.payment_method || !body.payment_details) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Make request to backend API
    const response = await axios.post(
      'https://api.riftbattle.com/seller/edit_payment_info',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session=${sessionCookie}`
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating payment info:', error);
    return NextResponse.json(
      { error: 'Failed to update payment information' },
      { status: 500 }
    );
  }
} 