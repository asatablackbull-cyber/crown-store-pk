import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { hashSync } from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data', 'crown-store.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    initializeDb(db);
  }
  return db;
}

function ensureColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function initializeDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      shortDescription TEXT,
      price REAL NOT NULL,
      comparePrice REAL,
      category TEXT DEFAULT 'jewelry',
      images TEXT DEFAULT '[]',
      sizes TEXT DEFAULT '[]',
      material TEXT DEFAULT '316L Stainless Steel',
      inStock INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT UNIQUE NOT NULL,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shippingCost REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      paymentMethod TEXT DEFAULT 'cod',
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discountType TEXT DEFAULT 'percent',
      discountValue REAL NOT NULL,
      minOrderAmount REAL DEFAULT 0,
      usageLimit INTEGER,
      usedCount INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      expiresAt TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  ensureColumn(db, 'orders', 'couponCode', 'TEXT');
  ensureColumn(db, 'orders', 'discountAmount', 'REAL DEFAULT 0');
  ensureColumn(db, 'products', 'ribbon', 'TEXT');
  ensureColumn(db, 'products', 'sku', 'TEXT');
  ensureColumn(db, 'products', 'weight', 'REAL');

  const defaultCategories = ['Bracelets', 'Rings', 'Sets', 'Pendants', 'Chains'];
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)');
  for (const name of defaultCategories) {
    insertCategory.run(name, name.toLowerCase());
  }

  const defaultSettings = {
    announcementEnabled: '0',
    announcementText: '',
    notificationEmail: '',
    codFee: '0',
    onlinePaymentEnabled: '0',
    onlinePaymentProvider: '',
    onlinePaymentInstructions: '',
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: '0',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: ''
  };
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(defaultSettings)) {
    insertSetting.run(key, value);
  }

  // Seed admin user if none exists
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    db.prepare(
      'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)'
    ).run('Admin', 'admin@crownstore.pk', hashSync('admin123', 10), 'admin');
  }

  // Seed products if none exist
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const seedProducts = [
      {
        name: 'Yin Yang Bead Bracelet Set',
        slug: 'yin-yang-bead-bracelet-set',
        description: 'A harmonious duo of genuine black onyx and arctic white marble bead bracelets. Each bead is hand-selected for its lustrous finish and natural veining. Strung on a durable elastic cord, this set represents balance and contrast — perfect for layering or gifting as a couples\' set. 100% waterproof and sweat-resistant.',
        shortDescription: 'Black onyx & white marble bead bracelet duo',
        price: 1499,
        comparePrice: 2499,
        category: 'bracelets',
        images: JSON.stringify(['/images/products/bead-bracelet-set.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L']),
        material: 'Genuine Black Onyx & Arctic Marble',
        featured: 1
      },
      {
        name: 'Royal Mesh Bracelet & Ring Set',
        slug: 'royal-mesh-bracelet-ring-set',
        description: 'The epitome of refined masculinity. This set features a precision-woven 316L stainless steel mesh bracelet with a gold-plated crown emblem clasp, paired with a matching mesh band ring. Tarnish-proof, waterproof, and designed for the modern gentleman who demands both elegance and durability.',
        shortDescription: 'Silver mesh bracelet with gold accent + matching ring',
        price: 2499,
        comparePrice: 3999,
        category: 'sets',
        images: JSON.stringify(['/images/products/mesh-bracelet-ring-set.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        material: '316L Stainless Steel, Gold Plating',
        featured: 1
      },
      {
        name: 'Crown Crest Open Bangle',
        slug: 'crown-crest-open-bangle',
        description: 'A statement piece that commands attention. This open bangle features a precision-crafted mesh body in marine-grade 316L stainless steel, adorned with a gold-plated crown crest and Greek key pattern. The open-cuff design provides a comfortable, adjustable fit. Waterproof, sweat-proof, and built to last a lifetime.',
        shortDescription: 'Silver mesh open bangle with gold crown emblem',
        price: 1999,
        comparePrice: 3499,
        category: 'bracelets',
        images: JSON.stringify(['/images/products/crown-crest-bangle.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, 18K Gold Plating',
        featured: 1
      },
      {
        name: 'Crown Signet Mesh Ring',
        slug: 'crown-signet-mesh-ring',
        description: 'The Crown Signet Mesh Ring is a masterclass in understated luxury. Crafted from precision-woven 316L stainless steel mesh, it features a subtle gold crown insignia that catches the light beautifully. Comfortable for everyday wear, this ring is 100% waterproof, hypoallergenic, and will never tarnish or fade.',
        shortDescription: 'Silver woven mesh ring with crown detail',
        price: 999,
        comparePrice: 1799,
        category: 'rings',
        images: JSON.stringify(['/images/products/crown-signet-ring.jpg']),
        sizes: JSON.stringify(['7', '8', '9', '10', '11', '12']),
        material: '316L Stainless Steel, Gold Accent',
        featured: 1
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (name, slug, description, shortDescription, price, comparePrice, category, images, sizes, material, featured)
      VALUES (@name, @slug, @description, @shortDescription, @price, @comparePrice, @category, @images, @sizes, @material, @featured)
    `);

    for (const product of seedProducts) {
      insertProduct.run(product);
    }
  }
}

export default getDb;
