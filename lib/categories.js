import getDb from './db';

export function getCategories() {
  const db = getDb();
  // node:sqlite returns null-prototype row objects, which React refuses to
  // pass from a Server Component to a Client Component as props — spread
  // each row into a plain object.
  return db.prepare('SELECT * FROM categories ORDER BY name ASC').all().map(c => ({ ...c }));
}
