import { getProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import ShopContent from './ShopContent';

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }) {
  const { category } = await searchParams;
  const activeCategory = category || 'all';

  const [products, categories] = [
    getProducts(activeCategory === 'all' ? {} : { category: activeCategory }),
    getCategories()
  ];

  return (
    <ShopContent
      key={activeCategory}
      initialCategory={activeCategory}
      initialCategories={categories}
      initialProducts={products}
    />
  );
}
