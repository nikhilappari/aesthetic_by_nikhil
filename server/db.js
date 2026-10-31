import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;
let dbConnectionPromise = null;

// Helper to convert SQLite SQL placeholders "?" into PostgreSQL "$1, $2, ..."
function convertSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

class DatabaseWrapper {
  constructor(isPg, dbClient) {
    this.isPg = isPg;
    this.client = dbClient;
  }

  async get(sql, params = []) {
    if (this.isPg) {
      const sqlToRun = convertSql(sql);
      const res = await this.client.query(sqlToRun, params);
      const row = res.rows[0] || null;
      if (row) {
        for (const key of Object.keys(row)) {
          if (key.toLowerCase().includes('count') && typeof row[key] === 'string') {
            row[key] = parseInt(row[key], 10);
          }
        }
      }
      return row;
    } else {
      return this.client.get(sql, params);
    }
  }

  async all(sql, params = []) {
    if (this.isPg) {
      const sqlToRun = convertSql(sql);
      const res = await this.client.query(sqlToRun, params);
      return res.rows.map(row => {
        for (const key of Object.keys(row)) {
          if (key.toLowerCase().includes('count') && typeof row[key] === 'string') {
            row[key] = parseInt(row[key], 10);
          }
        }
        return row;
      });
    } else {
      return this.client.all(sql, params);
    }
  }

  async run(sql, params = []) {
    if (this.isPg) {
      let sqlToRun = convertSql(sql);
      const upper = sqlToRun.toUpperCase();
      if (upper.startsWith('INSERT') && (upper.includes('USERS') || upper.includes('ARTWORKS') || (upper.includes('CLIENT_REQUESTS') || upper.includes('CONSENT_RECORDS') || upper.includes('DATA_RIGHTS_REQUESTS') || upper.includes('SITE_VISITS') || upper.includes('OTP_VERIFICATIONS'))) && !upper.includes('RETURNING')) {
        sqlToRun += ' RETURNING id';
      }
      const res = await this.client.query(sqlToRun, params);
      const lastID = res.rows && res.rows[0] ? res.rows[0].id : null;
      return { lastID, changes: res.rowCount };
    } else {
      return this.client.run(sql, params);
    }
  }

  async exec(sql) {
    if (this.isPg) {
      let sqlToRun = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
      return this.client.query(sqlToRun);
    } else {
      return this.client.exec(sql);
    }
  }
}

/**
 * Returns the open SQLite or PostgreSQL database connection singleton wrapped in our interface.
 */
export async function getDb() {
  if (!dbConnectionPromise) {
    dbConnectionPromise = (async () => {
      if (process.env.DATABASE_URL) {
        console.log("Connecting to production PostgreSQL database...");
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        dbInstance = new DatabaseWrapper(true, pool);
      } else {
        console.log("Connecting to local SQLite database...");
        const dbFolder = process.env.DB_DIR || __dirname;
        const dbPath = path.resolve(dbFolder, 'database.sqlite');
        const sqliteDb = await open({
          filename: dbPath,
          driver: sqlite3.Database
        });
        dbInstance = new DatabaseWrapper(false, sqliteDb);
      }
      return dbInstance;
    })();
  }

  return dbConnectionPromise;
}

/**
 * Initializes tables and seeds default data if tables are empty.
 */
export async function initDb() {
  const db = await getDb();

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      google_id TEXT UNIQUE
    )
  `);

  // Migrate existing database if google_id is not already present
  try {
    await db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE");
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Migrate existing users table for created_at and last_login tracking
  try {
    await db.exec("ALTER TABLE users ADD COLUMN created_at TEXT");
  } catch (e) {}

  try {
    await db.exec("ALTER TABLE users ADD COLUMN last_login TEXT");
  } catch (e) {}

  // Create Site Visits Table for Visitor Analytics
  await db.exec(`
    CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      path TEXT DEFAULT '/',
      referrer TEXT DEFAULT 'direct',
      user_agent TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Create OTP Verifications Table (Admin Login OTP & Forgot Password Reset)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  // Create Artworks Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS artworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Published',
      size TEXT DEFAULT 'A4',
      orientation TEXT DEFAULT 'Vertical'
    )
  `);

  // Migrate existing database for artworks new columns: size and orientation
  try {
    await db.exec("ALTER TABLE artworks ADD COLUMN size TEXT DEFAULT 'A4'");
  } catch (e) {
    // Column already exists, safe to ignore
  }

  try {
    await db.exec("ALTER TABLE artworks ADD COLUMN orientation TEXT DEFAULT 'Vertical'");
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Create Transformation Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transformation (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      before TEXT NOT NULL DEFAULT '',
      after TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT 'The Transformation',
      subtitle TEXT NOT NULL DEFAULT 'See how we turn your favorite memories into hand-drawn masterpieces.'
    )
  `);

  // Create Pricing/Settings Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pricing (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Create Client Requests Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS client_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      image TEXT NOT NULL,
      images TEXT NOT NULL, -- Stored as stringified JSON array
      price INTEGER NOT NULL DEFAULT 0,
      frame TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      customerApproval TEXT,
      adminNote TEXT,
      date TEXT NOT NULL,
      messages TEXT DEFAULT '[]'
    )
  `);

  // Migrate existing database for client_requests new column: messages
  try {
    await db.exec("ALTER TABLE client_requests ADD COLUMN messages TEXT DEFAULT '[]'");
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Create Consent Audit Records Table (DPDP Act 2023 Section 6 Compliance)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS consent_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      identifier TEXT NOT NULL,
      purpose TEXT NOT NULL,
      consented INTEGER NOT NULL DEFAULT 1,
      notice_version TEXT NOT NULL DEFAULT '2026.1-DPDP',
      ip_address TEXT,
      user_agent TEXT,
      timestamp TEXT NOT NULL
    )
  `);

  // Create Data Principal Rights Requests Table (DPDP Act 2023 Sections 11, 12, 13)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS data_rights_requests (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      request_type TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Clean up old default 'admin' user if present
  await db.run("DELETE FROM users WHERE username = ?", ["admin"]);

  // Seed default admin if not exists
  const adminExists = await db.get("SELECT * FROM users WHERE username = ?", ["aesthetic_by_nikhil"]);
  if (!adminExists) {
    const defaultPasswordHash = await bcrypt.hash("Nikhil@2006", 10);
    await db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ["aesthetic_by_nikhil", defaultPasswordHash, "admin"]);
    console.log("Database seeded with default Admin user ('aesthetic_by_nikhil' / 'Nikhil@2006')");
  }

  // Seed default artworks if empty
  const artworksCount = await db.get("SELECT COUNT(*) as count FROM artworks");
  if (artworksCount.count === 0) {
    const initialArtworks = [
      {
        title: "Classic Monochrome",
        type: "Black & White",
        category: "Single Portrait",
        price: 1500,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000",
        description: "Deep charcoal textures capturing every emotion."
      },
      {
        title: "Vibrant Soul",
        type: "Color",
        category: "Single Portrait",
        price: 2500,
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000",
        description: "Hyper-realistic color pencil work with soft blending."
      },
      {
        title: "The Eternal Bond",
        type: "Black & White",
        category: "Couple Portrait",
        price: 3500,
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000",
        description: "Detailed couple portrait in A3 size."
      },
      {
        title: "Radiant Smile",
        type: "Color",
        category: "Single Portrait",
        price: 2200,
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1000",
        description: "Bright color palette for joyful memories."
      },
      {
        title: "Shadow & Light",
        type: "Black & White",
        category: "Single Portrait",
        price: 1800,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000",
        description: "Dramatic lighting captured in pencil."
      },
      {
        title: "Sunset Glow",
        type: "Color",
        category: "Couple Portrait",
        price: 4500,
        image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=1000",
        description: "Warm tones and intricate detail for couples."
      }
    ];

    for (const art of initialArtworks) {
      await db.run(
        "INSERT INTO artworks (title, type, category, price, image, description, status) VALUES (?, ?, ?, ?, ?, ?, 'Published')",
        [art.title, art.type, art.category, art.price, art.image, art.description]
      );
    }
    console.log("Database seeded with default artworks.");
  }

  // Seed default transformation settings if empty
  const transCount = await db.get("SELECT COUNT(*) as count FROM transformation WHERE id = 1");
  if (transCount.count === 0) {
    await db.run(`
      INSERT INTO transformation (id, before, after, title, subtitle) 
      VALUES (1, '', '', 'The Transformation', 'See how we turn your favorite memories into hand-drawn masterpieces.')
    `);
    console.log("Database seeded with default transformation parameters.");
  }

  // Seed default pricing parameters if empty
  const pricingCount = await db.get("SELECT COUNT(*) as count FROM pricing");
  if (pricingCount.count === 0) {
    const defaultPricing = {
      charcoalA4: '1500',
      charcoalA3: '2500',
      charcoalCouple: '3500',
      graphiteA4: '1500',
      graphiteA3: '2500',
      graphiteCouple: '3500',
      colorA4: '2200',
      colorA3: '3200',
      colorCouple: '4500',
      frameA4Normal: '300',
      frameA4Premium: '500',
      frameA3Normal: '500',
      frameA3Premium: '700',
      cloudinaryCloudName: '',
      cloudinaryUploadPreset: ''
    };

    for (const [key, value] of Object.entries(defaultPricing)) {
      await db.run("INSERT INTO pricing (key, value) VALUES (?, ?)", [key, value]);
    }
    console.log("Database seeded with default base pricing.");
  }
}
