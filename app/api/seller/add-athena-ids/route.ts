import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { athena_ids } = await request.json();

    if (!Array.isArray(athena_ids)) {
      return NextResponse.json(
        { error: 'athena_ids must be an array' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.riftbattle.com/seller/add_athena_ids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ athena_ids }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding Athena IDs:', error);
    return NextResponse.json(
      { error: 'Failed to add Athena IDs' },
      { status: 500 }
    );
  }
} 