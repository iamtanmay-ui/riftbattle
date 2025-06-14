import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const { seller_name } = await request.json();

    if (!seller_name) {
      return NextResponse.json(
        { error: 'seller_name is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.riftbattle.com/seller/edit_seller_info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seller_name }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error editing seller info:', error);
    return NextResponse.json(
      { error: 'Failed to edit seller information' },
      { status: 500 }
    );
  }
} 