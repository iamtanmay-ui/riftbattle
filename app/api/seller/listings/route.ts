import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Forward to our main endpoint
  return NextResponse.redirect(new URL('/api/seller/create_product', req.url));
} 