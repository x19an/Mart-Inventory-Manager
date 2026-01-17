
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 5000;
const HOST = '127.0.0.1'; 

app.use(cors());
app.use(express.json({ limit: '100mb' }));

let db;

async function initDB() {
  try {
    console.log('---------------------------------------------------');
    console.log('[SQL] Initializing SQLite database...');
    
    db = await open({
      filename: './inventory.db',
      driver: sqlite3.Database
    });

    // Ensure core schema exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER,
        reorderLevel INTEGER,
        unitsSold INTEGER
      );

      CREATE TABLE IF NOT EXISTS categories (
        name TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        martName TEXT,
        adminName TEXT,
        address TEXT,
        contact TEXT,
        currency TEXT,
        accessPin TEXT,
        useExternalDB BOOLEAN,
        apiEndpoint TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        checkoutId TEXT,
        productId TEXT,
        productName TEXT,
        type TEXT,
        quantity INTEGER,
        price REAL,
        total REAL,
        timestamp INTEGER
      );
    `);

    console.log('[SQL] Database schema is ready.');
    
    app.listen(PORT, HOST, () => {
      console.log('---------------------------------------------------');
      console.log(`🚀 SQL BACKEND ONLINE: http://${HOST}:${PORT}/api`);
      console.log(`✅ Status: Listening for sync requests...`);
      console.log('---------------------------------------------------');
    });

  } catch (err) {
    console.error('[SQL] Critical Startup Error:', err);
    process.exit(1);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: !!db });
});

app.get('/api/get-all', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database initializing...' });
  try {
    // Fetch products and normalize column names
    const rawProducts = await db.all('SELECT * FROM products');
    const products = rawProducts.map(p => ({
      id: String(p.id),
      name: p.name || 'Unnamed Product',
      category: p.category || 'Uncategorized',
      price: Number(p.price || 0),
      stock: Number(p.stock !== undefined ? p.stock : (p.quantity !== undefined ? p.quantity : 0)),
      reorderLevel: Number(p.reorderLevel !== undefined ? p.reorderLevel : (p.reorder_level !== undefined ? p.reorder_level : 10)),
      unitsSold: Number(p.unitsSold !== undefined ? p.unitsSold : (p.sales_count !== undefined ? p.sales_count : 0))
    }));

    // Fetch transactions and normalize timestamps (Seconds to Milliseconds)
    const rawTransactions = await db.all('SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 5000');
    const transactions = rawTransactions.map(t => {
      let ts = Number(t.timestamp);
      // Heuristic: If timestamp is less than 10 billion, it's likely in seconds (Unix)
      // JS milliseconds are currently around 1.7 trillion
      if (ts < 10000000000) {
        ts = ts * 1000;
      }

      // Map 'ADDITION' or other types from external scripts to App types
      let type = t.type;
      if (type === 'ADDITION') type = 'STOCK_ADD';
      if (type === 'ADJUSTMENT') type = 'STOCK_ADJUST';

      return {
        id: String(t.id),
        checkoutId: String(t.checkoutId || ''),
        productId: String(t.productId || ''),
        productName: t.productName || 'Unknown Product',
        type: type,
        quantity: Number(t.quantity || 0),
        price: Number(t.price || 0),
        total: Number(t.total || (Number(t.price || 0) * Number(t.quantity || 0))),
        timestamp: ts
      };
    });

    const categoriesRows = await db.all('SELECT * FROM categories');
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');

    res.json({
      products: products || [],
      categories: categoriesRows.map(c => c.name) || [],
      settings: settings || null,
      transactions: transactions || []
    });
  } catch (err) {
    console.error('[SQL] Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sync', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database initializing...' });
  const { products, categories, settings, transactions } = req.body;

  try {
    await db.run('BEGIN TRANSACTION');
    await db.run('DELETE FROM products');
    for (const p of products) {
      await db.run(
        'INSERT INTO products (id, name, category, price, stock, reorderLevel, unitsSold) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.category, p.price, p.stock, p.reorderLevel, p.unitsSold]
      );
    }
    await db.run('DELETE FROM categories');
    for (const cat of categories) {
      await db.run('INSERT INTO categories (name) VALUES (?)', [cat]);
    }
    if (settings) {
      await db.run('DELETE FROM settings');
      await db.run(
        'INSERT INTO settings (id, martName, adminName, address, contact, currency, accessPin, useExternalDB, apiEndpoint) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)',
        [settings.martName, settings.adminName, settings.address, settings.contact, settings.currency, settings.accessPin, settings.useExternalDB, settings.apiEndpoint]
      );
    }
    await db.run('DELETE FROM transactions');
    for (const t of transactions) {
      await db.run(
        'INSERT INTO transactions (id, checkoutId, productId, productName, type, quantity, price, total, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.checkoutId, t.productId, t.productName, t.type, t.quantity, t.price, t.total, t.timestamp]
      );
    }
    await db.run('COMMIT');
    res.json({ success: true });
  } catch (err) {
    if (db) await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

initDB();
