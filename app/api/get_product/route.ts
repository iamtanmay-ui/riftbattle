import { NextResponse } from 'next/server';

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

interface CosmeticItem {
  id: string;
  name: string;
  rarity: string;
  image: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Received request for product ID:', id);

    if (!id) {
      console.error('No product ID provided');
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    console.log('Fetching product from API');
    // Fetch product from the API
    const response = await fetch(`https://api.riftbattle.com/get_products?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API error:', error);
      return NextResponse.json(
        { error: error.error || 'Failed to get product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Received product data from API:', data);

    // Find the specific product by ID
    const productData = Array.isArray(data) ? data.find(p => p.id === parseInt(id, 10)) : data;
    
    if (!productData) {
      console.error('Product not found');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform the API response to match our Product interface
    const product: Product = {
      id: productData.id || parseInt(id, 10),
      name: productData.name || '',
      price: productData.price || 0,
      credentials: productData.credentials || '',
      seller_id: productData.seller_id || 0,
      athena_ids: productData.athena_ids || [],
      stats: productData.stats || {},
      description: productData.description || '',
      date: productData.date || Date.now(),
      active: productData.active || true,
      discount: productData.discount || 0
    };

    console.log('Transformed product:', product);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    );
  }
} 