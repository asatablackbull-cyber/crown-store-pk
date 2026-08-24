import { getProductBySlug } from '@/lib/products';
import ProductDetailContent from './ProductDetailContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found — Crown Store PK' };

  return {
    title: `${product.name} — Crown Store PK`,
    description: product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : undefined
    }
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return <div className="page-header"><h1>Product Not Found</h1></div>;

  return <ProductDetailContent product={product} />;
}
