import getDb from './db';

export function parseProduct(p) {
  return {
    ...p,
    images: JSON.parse(p.images || '[]'),
    sizes: JSON.parse(p.sizes || '[]'),
    unavailableSizes: JSON.parse(p.unavailableSizes || '[]'),
    inStock: Boolean(p.inStock),
    featured: Boolean(p.featured)
  };
}

export function getProducts({ category, featured, search } = {}) {
  const db = getDb();
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (featured) {
    query += ' AND featured = 1';
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY createdAt DESC';

  return db.prepare(query).all(...params).map(parseProduct);
}

export function getProductBySlug(slug) {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug);
  return product ? parseProduct(product) : null;
}
