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

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'manual',
      instructions TEXT DEFAULT '',
      extraFee REAL DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      sortOrder INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  ensureColumn(db, 'orders', 'couponCode', 'TEXT');
  ensureColumn(db, 'orders', 'discountAmount', 'REAL DEFAULT 0');
  ensureColumn(db, 'products', 'ribbon', 'TEXT');
  ensureColumn(db, 'products', 'sku', 'TEXT');
  ensureColumn(db, 'products', 'weight', 'REAL');
  ensureColumn(db, 'products', 'unavailableSizes', "TEXT DEFAULT '[]'");

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

  // Seed payment methods if none exist, migrating any existing COD /
  // online-payment settings so admins who already configured those don't
  // lose their setup when the standalone settings fields are retired.
  const paymentMethodCount = db.prepare('SELECT COUNT(*) as count FROM payment_methods').get();
  if (paymentMethodCount.count === 0) {
    const getSettingValue = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value || '';
    const codFee = parseFloat(getSettingValue('codFee')) || 0;
    db.prepare(`
      INSERT INTO payment_methods (name, type, instructions, extraFee, enabled, sortOrder)
      VALUES (?, 'cod', '', ?, 1, 0)
    `).run('Cash on Delivery', codFee);

    if (getSettingValue('onlinePaymentEnabled') === '1' && getSettingValue('onlinePaymentProvider')) {
      db.prepare(`
        INSERT INTO payment_methods (name, type, instructions, extraFee, enabled, sortOrder)
        VALUES (?, 'manual', ?, 0, 1, 1)
      `).run(getSettingValue('onlinePaymentProvider'), getSettingValue('onlinePaymentInstructions'));
    }
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
        name: 'Infinity Cable Wrap Ring',
        slug: 'cable-wrap-ring',
        description: 'A modern take on the classic cable bangle, reimagined as a ring. Finely twisted 316L stainless steel wire wraps into a sleek open band, finished with a polished ball stud where the ends meet. Comfortable, adjustable, and endlessly wearable — waterproof and tarnish-proof for everyday luxury.',
        shortDescription: 'Twisted cable-texture ring with a polished ball accent',
        price: 1299,
        comparePrice: 2199,
        category: 'rings',
        images: JSON.stringify(['/images/products/cable-wrap-ring.jpg', '/images/products/cable-wrap-ring-2.jpg', '/images/products/cable-wrap-ring-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel',
        featured: 1
      },
      {
        name: 'Sovereign Mesh Cuff — Silver',
        slug: 'crown-mesh-cuff-silver',
        description: 'A precision-woven stainless steel mesh cuff with an open, adjustable design for a comfortable everyday fit. A gold-toned crown emblem plaque sits at the center, adding a refined statement touch. 100% waterproof, tarnish-proof, and built for daily wear.',
        shortDescription: 'Silver mesh open cuff with a gold crown emblem plaque',
        price: 2299,
        comparePrice: 3799,
        category: 'bracelets',
        images: JSON.stringify(['/images/products/crown-mesh-cuff-silver.jpg', '/images/products/crown-mesh-cuff-silver-2.jpg', '/images/products/crown-mesh-cuff-silver-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Gold-Tone Plaque',
        featured: 1
      },
      {
        name: 'Sovereign Mesh Cuff — Black Edition',
        slug: 'crown-mesh-cuff-black',
        description: 'The Sovereign Cuff in a stealth black finish. Precision-woven stainless steel mesh with a matte black PVD coating and a subtle crown emblem plaque, for a bold, understated look. Open-cuff design adjusts to fit comfortably. Waterproof and tarnish-proof.',
        shortDescription: 'All-black mesh open cuff with a matte crown emblem plaque',
        price: 2299,
        comparePrice: 3799,
        category: 'bracelets',
        images: JSON.stringify(['/images/products/crown-mesh-cuff-black.jpg', '/images/products/crown-mesh-cuff-black-2.jpg', '/images/products/crown-mesh-cuff-black-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Black PVD Coating',
        featured: 0
      },
      {
        name: 'Onyx Dog-Tag Pendant Necklace',
        slug: 'onyx-tag-pendant',
        description: 'A sleek rectangular tag pendant set with genuine black onyx, framed in polished stainless steel and hung from a durable box-link chain. Minimal, masculine, and effortlessly versatile — waterproof and tarnish-proof for everyday wear.',
        shortDescription: 'Genuine black onyx tag pendant on a box chain',
        price: 1599,
        comparePrice: 2699,
        category: 'pendants',
        images: JSON.stringify(['/images/products/onyx-tag-pendant.jpg', '/images/products/onyx-tag-pendant-2.jpg', '/images/products/onyx-tag-pendant-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Genuine Black Onyx',
        featured: 0
      },
      {
        name: 'Mother-of-Pearl Tag Pendant Necklace',
        slug: 'pearl-tag-pendant',
        description: 'The same refined tag silhouette as our Onyx pendant, reset with genuine mother-of-pearl for a soft, iridescent shimmer. Framed in polished stainless steel and hung from a sturdy box-link chain. 100% waterproof and tarnish-proof.',
        shortDescription: 'Iridescent mother-of-pearl tag pendant on a box chain',
        price: 1699,
        comparePrice: 2799,
        category: 'pendants',
        images: JSON.stringify(['/images/products/pearl-tag-pendant.jpg', '/images/products/pearl-tag-pendant-2.jpg', '/images/products/pearl-tag-pendant-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Genuine Mother-of-Pearl',
        featured: 0
      },
      {
        name: 'Meander Greek Key Band Ring',
        slug: 'greek-key-ring',
        description: 'An ancient Greek key (meander) pattern wraps continuously around this textured stainless steel band, symbolizing infinity and unity. A timeless, architectural design that pairs well solo or stacked. Hypoallergenic, waterproof, and tarnish-proof.',
        shortDescription: 'Textured stainless steel band with a classic Greek key motif',
        price: 1199,
        comparePrice: 1999,
        category: 'rings',
        images: JSON.stringify(['/images/products/greek-key-ring.jpg', '/images/products/greek-key-ring-2.jpg', '/images/products/greek-key-ring-3.jpg']),
        sizes: JSON.stringify(['18', '19', '20']),
        material: '316L Stainless Steel',
        featured: 0
      },
      {
        name: 'Roman Numeral Pearl Medallion Necklace',
        slug: 'pearl-roman-pendant',
        description: 'A round medallion pendant set with genuine mother-of-pearl at its center, encircled by an engraved roman numeral dial. Hung from a box-link chain for a refined, timepiece-inspired look. Waterproof and tarnish-proof.',
        shortDescription: 'Round mother-of-pearl medallion framed in roman numerals',
        price: 1799,
        comparePrice: 2999,
        category: 'pendants',
        images: JSON.stringify(['/images/products/pearl-roman-pendant.jpg', '/images/products/pearl-roman-pendant-2.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Genuine Mother-of-Pearl',
        featured: 1
      },
      {
        name: 'Roman Numeral Onyx Medallion Necklace',
        slug: 'onyx-roman-pendant',
        description: 'The Roman Numeral Medallion in genuine black onyx — a deep, lustrous centerpiece encircled by an engraved roman numeral dial, hung from a box-link chain. Bold, timepiece-inspired, waterproof, and tarnish-proof.',
        shortDescription: 'Round black onyx medallion framed in roman numerals',
        price: 1699,
        comparePrice: 2899,
        category: 'pendants',
        images: JSON.stringify(['/images/products/onyx-roman-pendant.jpg', '/images/products/onyx-roman-pendant-2.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Genuine Black Onyx',
        featured: 0
      },
      {
        name: 'Gladiator Sword Pendant Necklace',
        slug: 'gladiator-sword-pendant',
        description: 'A finely detailed sword pendant with an ornate hilt and engraved blade, cast in polished stainless steel. A bold, statement piece for anyone who wears their confidence like armor. Hung from a durable box-link chain — waterproof and tarnish-proof.',
        shortDescription: 'Ornate engraved sword pendant on a box chain',
        price: 1899,
        comparePrice: 3199,
        category: 'pendants',
        images: JSON.stringify(['/images/products/gladiator-sword-pendant.jpg', '/images/products/gladiator-sword-pendant-2.jpg', '/images/products/gladiator-sword-pendant-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel',
        featured: 1
      },
      {
        name: 'Magnetic Heart Couple Bracelets — Set of 2',
        slug: 'couple-heart-bracelets',
        description: 'A set of two beaded bracelets designed for two — genuine black onyx and rose quartz beads, joined by a magnetic heart charm that clicks together when you\'re close. A meaningful gift for couples, best friends, or anyone you want to stay connected to. 100% waterproof and sweat-resistant.',
        shortDescription: 'Matching onyx & quartz bead bracelets with a magnetic heart clasp',
        price: 1499,
        comparePrice: 2499,
        category: 'sets',
        images: JSON.stringify(['/images/products/couple-heart-bracelets.jpg', '/images/products/couple-heart-bracelets-2.jpg', '/images/products/couple-heart-bracelets-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: 'Genuine Black Onyx & Rose Quartz',
        featured: 1
      },
      {
        name: 'Crown Emblem Mesh Band Ring',
        slug: 'crown-emblem-ring',
        description: 'A wide, precision-woven stainless steel mesh band with a subtle crown emblem detail. Comfortable for everyday wear, this ring is 100% waterproof, hypoallergenic, and will never tarnish or fade.',
        shortDescription: 'Wide woven mesh band with a subtle crown emblem',
        price: 999,
        comparePrice: 1799,
        category: 'rings',
        images: JSON.stringify(['/images/products/crown-emblem-ring.jpg', '/images/products/crown-emblem-ring-2.jpg']),
        sizes: JSON.stringify(['18', '19', '20']),
        material: '316L Stainless Steel',
        featured: 0
      },
      {
        name: 'Engraved Statement Bangle',
        slug: 'engraved-statement-bangle',
        description: 'A sleek, minimalist bangle in a matte black finish, finished with an engraved wordmark detail along the band. A refined statement piece that pairs effortlessly with both casual and formal looks. Waterproof and tarnish-proof.',
        shortDescription: 'Sleek black bangle with a minimalist engraved wordmark',
        price: 1799,
        comparePrice: 2999,
        category: 'bracelets',
        images: JSON.stringify(['/images/products/engraved-statement-bangle.jpg', '/images/products/engraved-statement-bangle-2.jpg', '/images/products/engraved-statement-bangle-3.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Black PVD Coating',
        featured: 0
      },
      {
        name: 'Pavé Lightning Bolt Pendant Necklace',
        slug: 'lightning-bolt-pendant',
        description: 'A bold lightning bolt pendant fully paved with sparkling cubic zirconia stones, set in polished stainless steel. An electric statement piece that catches the light with every move. Hung from a box-link chain — waterproof and tarnish-proof.',
        shortDescription: 'CZ-studded lightning bolt pendant on a box chain',
        price: 1599,
        comparePrice: 2699,
        category: 'pendants',
        images: JSON.stringify(['/images/products/lightning-bolt-pendant.jpg', '/images/products/lightning-bolt-pendant-2.jpg']),
        sizes: JSON.stringify(['One Size']),
        material: '316L Stainless Steel, Cubic Zirconia',
        featured: 0
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
