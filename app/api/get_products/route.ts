import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riftbattle.com';

// Define Product type based on swagger definition
interface Product {
  id: number;
  name: string;
  price: number;
  credentials: string;
  seller_id: number;
  athena_ids: string[];
  stats: Record<string, string>;
  description: string;
  date: number;
  active: boolean;
  discount: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const platform = searchParams.get('platform');
  const categories = searchParams.get('categories');
  const cosmetics = searchParams.get('cosmetics');

  try {
    const response = await fetch(`${API_BASE_URL}/get_products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://riftbattle.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'false'
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://riftbattle.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'false'
      }
    });
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://riftbattle.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'false'
    }
  });
}

export async function POST(request: Request) {
  try {
    const product = await request.json() as Product;
    
    // TODO: Add validation and database insertion
    // This should be replaced with actual database operations
    
    return NextResponse.json(
      { message: 'Product created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 