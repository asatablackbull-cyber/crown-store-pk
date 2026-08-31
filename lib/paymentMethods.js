import getDb from './db';

export function getEnabledPaymentMethods() {
  const db = getDb();
  return db.prepare('SELECT * FROM payment_methods WHERE enabled = 1 ORDER BY sortOrder ASC, id ASC').all().map(m => ({ ...m }));
}

export function getAllPaymentMethods() {
  const db = getDb();
  return db.prepare('SELECT * FROM payment_methods ORDER BY sortOrder ASC, id ASC').all().map(m => ({ ...m }));
}

export function getPaymentMethodById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id);
  return row ? { ...row } : null;
}
