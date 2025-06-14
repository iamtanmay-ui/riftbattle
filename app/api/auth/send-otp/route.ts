import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    try {
      // Call the backend API to send OTP
      const response = await axios.post('https://api.riftbattle.com/send_otp', {
        email
      });

      // According to swagger spec, the API just returns success status
      if (response.status !== 200) {
        throw new Error('Failed to send OTP');
      }

      return NextResponse.json({ success: true });
    } catch (apiError: any) {
      console.error('Error calling backend API:', apiError);
      
      // Handle specific error cases
      if (apiError.response?.status === 400) {
        const errorMessage = apiError.response.data?.error || 'Please try again later';
        return NextResponse.json({ error: errorMessage }, { status: 429 }); // Use 429 for rate limiting
      }
      
      return NextResponse.json(
        { error: 'Failed to send verification code. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
