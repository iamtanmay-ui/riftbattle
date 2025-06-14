import { NextResponse } from 'next/server';
import axios from 'axios';

// Payment methods supported by the system
type PaymentMethod = 'telegram_stars' | 'paypal' | 'nowpayments';

// Define request body interface
interface CreateOrderRequest {
  email: string;
  product_id: number;
  payment_method: PaymentMethod;
  coupon?: string;
  warranty?: number;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: CreateOrderRequest = await request.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }
    
    if (!body.product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }
    
    if (!body.payment_method) {
      return NextResponse.json({ error: 'payment_method is required' }, { status: 400 });
    }
    
    // Check if payment method is supported
    const supportedPaymentMethods: PaymentMethod[] = ['telegram_stars', 'paypal', 'nowpayments'];
    if (!supportedPaymentMethods.includes(body.payment_method)) {
      return NextResponse.json({ error: 'invalid payment method' }, { status: 400 });
    }
    
    console.log('Creating order with:', JSON.stringify(body, null, 2));
    
    // Generate a unique order ID
    const orderId = Math.floor(Math.random() * 1000000).toString();
    
    // Get base URL for building the success redirect URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const successUrl = `${protocol}://${host}/payment/success?order_id=${orderId}&payment_method=${body.payment_method}&email=${encodeURIComponent(body.email)}`;
    
    let paymentUrl: string;
    
    try {
      // Try to forward the request to the external API
      const apiResponse = await axios.post('https://api.riftbattle.com/create_order', {
        ...body,
        success_url: successUrl, // Add our success URL for the API to redirect to
      });
      
      // Use the payment URL from the API response if available
      paymentUrl = apiResponse.data.payment_url;
    } catch (apiError) {
      console.log('API error, using test payment flows', apiError);
      
      // If API call fails or for testing, use our test payment flows
      
      // Generate test payment URLs for each payment method
      switch (body.payment_method) {
        case 'paypal':
          // Simulate PayPal payment flow
          // In a real integration, PayPal would redirect to our success_url after payment
          paymentUrl = `https://sandbox.paypal.com/checkoutnow?token=test_${orderId}&return=${encodeURIComponent(successUrl)}`;
          break;
          
        case 'telegram_stars':
          // Simulate Telegram Stars payment flow
          // For testing, we'll just redirect directly to success page after 3 seconds
          paymentUrl = `/payment/mock-telegram?redirect=${encodeURIComponent(successUrl)}`;
          break;
          
        case 'nowpayments':
        default:
          // Crypto payments
          paymentUrl = `https://nowpayments.io/payment/?orderId=${orderId}&coin=btc&success_url=${encodeURIComponent(successUrl)}`;
          break;
      }
    }
    
    // Return the payment URL and order information
    return NextResponse.json({
      payment_url: paymentUrl,
      order_id: orderId,
      success_url: successUrl
    });
  } catch (error: any) {
    console.error('Error creating order:', error.response?.data || error.message);
    
    // If we got an error response from the API, forward it
    if (error.response?.data) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status || 500 }
      );
    }
    
    // Otherwise return a generic error
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 