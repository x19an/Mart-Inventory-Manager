
let db: any = null;
let SQL: any = null;

const DB_STORAGE_KEY = 'mart_inventory_sqlite_db';
const WASM_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm';

export const initDatabase = async () => {
  if (db) return db;

  try {
    const sqlInit = (window as any).initSqlJs;
    if (!sqlInit) {
      throw new Error("sql.js library not found on window.");
    }

    SQL = await sqlInit({
      locateFile: (file: string) => WASM_URL
    });

    const savedDb = localStorage.getItem(DB_STORAGE_KEY);
    if (savedDb) {
      try {
        const binaryString = atob(savedDb);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        db = new SQL.Database(bytes);
      } catch (e) {
        createNewDatabase();
      }
    } else {
      createNewDatabase();
    }

    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

const createNewDatabase = () => {
  db = new SQL.Database();
  createTables();
  seedInitialData();
  saveDatabase();
};

const createTables = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      reorderLevel INTEGER NOT NULL,
      salesCount INTEGER DEFAULT 0,
      FOREIGN KEY(category) REFERENCES categories(name)
    );

    CREATE TABLE IF NOT EXISTS sales_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT,
      productName TEXT,
      quantity INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(productId) REFERENCES products(id)
    );
  `);
};

const seedInitialData = () => {
  const initialCategories = ['Groceries', 'Bakery', 'Dairy', 'Confectionery', 'Beverages', 'Electronics'];
  const catStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
  initialCategories.forEach(cat => catStmt.run([cat]));
  catStmt.free();

  const initialProducts = [
    ['1', 'Premium Coffee Beans', 'Groceries', 15.99, 50, 10, 120],
    ['2', 'Organic Honey', 'Groceries', 12.50, 30, 5, 85],
    ['3', 'Whole Wheat Bread', 'Bakery', 3.99, 15, 20, 200],
    ['4', 'Fresh Milk 1L', 'Dairy', 2.49, 45, 15, 340],
    ['5', 'Chocolate Bar', 'Confectionery', 1.20, 100, 25, 500]
  ];

  const stmt = db.prepare("INSERT INTO products (id, name, category, price, quantity, reorderLevel, salesCount) VALUES (?, ?, ?, ?, ?, ?, ?)");
  initialProducts.forEach(p => stmt.run(p));
  stmt.free();
};

const saveDatabase = () => {
  if (!db) return;
  try {
    const data = db.export();
    let binary = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(data[i]);
    }
    localStorage.setItem(DB_STORAGE_KEY, btoa(binary));
  } catch (e) {
    console.error("Failed to save database:", e);
  }
};

export const getProductsFromDB = () => {
  if (!db) return [];
  try {
    const res = db.exec("SELECT * FROM products");
    if (res.length === 0) return [];
    const columns = res[0].columns;
    return res[0].values.map((row: any) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  } catch (e) {
    return [];
  }
};

export const deleteProductFromDB = (id: string) => {
  if (!db) return;
  db.run(`DELETE FROM products WHERE id = '${id}'`);
  saveDatabase();
};

export const getCategoriesFromDB = () => {
  if (!db) return [];
  try {
    const res = db.exec("SELECT * FROM categories ORDER BY name ASC");
    if (res.length === 0) return [];
    return res[0].values.map((row: any) => ({ name: row[0] }));
  } catch (e) {
    return [];
  }
};

export const addCategoryToDB = (name: string) => {
  if (!db) return;
  try {
    db.run(`INSERT INTO categories (name) VALUES ('${name.replace(/'/g, "''")}')`);
    saveDatabase();
  } catch (e) {
    console.error("Error adding category:", e);
  }
};

export const deleteCategoryFromDB = (name: string) => {
  if (!db) return;
  db.run(`DELETE FROM categories WHERE name = '${name.replace(/'/g, "''")}'`);
  saveDatabase();
};

export const addProductToDB = (product: any) => {
  if (!db) return null;
  const id = Math.random().toString(36).substr(2, 9);
  try {
    const stmt = db.prepare("INSERT INTO products (id, name, category, price, quantity, reorderLevel, salesCount) VALUES (?, ?, ?, ?, ?, ?, 0)");
    stmt.run([id, product.name, product.category, product.price, product.quantity, product.reorderLevel]);
    stmt.free();
    saveDatabase();
    return id;
  } catch (e) {
    console.error("Error adding product:", e);
    return null;
  }
};

export const processSaleInDB = (idOrName: string, qty: number) => {
  if (!db) return { success: false, message: "Database not initialized." };
  try {
    const sanitized = idOrName.replace(/'/g, "''");
    const res = db.exec(`SELECT * FROM products WHERE id = '${sanitized}' OR LOWER(name) = LOWER('${sanitized}')`);
    if (res.length === 0 || res[0].values.length === 0) {
      return { success: false, message: "Product not found." };
    }
    const product = res[0].values[0];
    const pId = product[0];
    const pName = product[1];
    const currentQty = product[4];
    const currentSales = product[6];
    if (currentQty < qty) {
      return { success: false, message: "Insufficient stock." };
    }
    db.run(`UPDATE products SET quantity = ${currentQty - qty}, salesCount = ${currentSales + qty} WHERE id = '${pId}'`);
    db.run(`INSERT INTO sales_ledger (productId, productName, quantity) VALUES ('${pId}', '${pName}', ${qty})`);
    saveDatabase();
    return { success: true, message: `Sold ${qty} units of ${pName}.` };
  } catch (e) {
    return { success: false, message: "Transaction error." };
  }
};
