import { Metadata } from 'next';
import ProductDetailClient from './product-detail-client';

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  // In a real app, you would fetch all product IDs from your API
  // For now, we'll hardcode a few IDs for demonstration
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

export const metadata: Metadata = {
  title: 'Product Details | Rift Battle Marketplace',
  description: 'View detailed information about this product',
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient id={params.id} />;
}
