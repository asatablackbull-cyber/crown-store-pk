import getDb from './db';

export function getAllSettings() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) settings[row.key] = row.value;
  return settings;
}

export function getSetting(key, fallback = '') {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function updateSettings(updates) {
  const db = getDb();
  const upsert = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  db.exec('BEGIN');
  try {
    for (const [key, value] of Object.entries(updates)) {
      upsert.run(key, String(value ?? ''));
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return getAllSettings();
}

export const PUBLIC_SETTING_KEYS = [
  'announcementEnabled',
  'announcementText',
  'codFee',
  'shippingCharge',
  'onlinePaymentEnabled',
  'onlinePaymentProvider',
  'onlinePaymentInstructions',
  'whatsappNumber',
  'socialInstagram',
  'socialFacebook',
  'socialTiktok'
];

export function getPublicSettings() {
  const all = getAllSettings();
  const publicSettings = {};
  for (const key of PUBLIC_SETTING_KEYS) publicSettings[key] = all[key] ?? '';
  return publicSettings;
}
