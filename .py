import sqlite3
import random
import uuid
from datetime import datetime, timedelta

def populate_mart_db():
    conn = sqlite3.connect('inventory.db')
    cursor = conn.cursor()

    # 1. Initialize Tables based on your exact schema
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS categories (name TEXT PRIMARY KEY);
    
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        reorder_level INTEGER NOT NULL,
        sales_count INTEGER DEFAULT 0,
        FOREIGN KEY(category) REFERENCES categories(name)
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

    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        martName TEXT, adminName TEXT, address TEXT, contact TEXT,
        currency TEXT, accessPin TEXT, useExternalDB BOOLEAN, apiEndpoint TEXT
    );
    """)

    # 2. Setup initial data
    cursor.execute("INSERT OR REPLACE INTO settings VALUES (1, 'Hashir Super Mart', 'Admin User', 'Address', '03038968926', 'Rs.', '5643', 0, 'http://127.0.0.1:5000/api')")
    
    cats = ['Electronics', 'Beverages', 'Confectionery', 'Dairy', 'Bakery', 'Groceries']
    for cat in cats:
        cursor.execute("INSERT OR IGNORE INTO categories (name) VALUES (?)", (cat,))

    # 3. Create 550 Products
    print("Generating products...")
    for i in range(1, 551):
        name = f"Item {i:03}"
        cat = random.choice(cats)
        price = round(random.uniform(10.0, 1500.0), 2)
        qty = random.randint(50, 200)
        cursor.execute("""
            INSERT INTO products (name, category, price, quantity, reorder_level, sales_count)
            VALUES (?, ?, ?, ?, 15, 0)
        """, (name, cat, price, qty))

    # 4. Generate 3500 Transactions over the last year
    cursor.execute("SELECT id, name, price FROM products")
    products = cursor.fetchall()
    
    print("Simulating 3500 historical transactions...")
    start_point = datetime.now() - timedelta(days=365)

    for _ in range(3500):
        p_id, p_name, p_price = random.choice(products)
        is_sale = random.random() < 0.85 
        t_type = 'SALE' if is_sale else 'ADDITION'
        qty = random.randint(1, 10)
        
        # Random date/time within the last year
        ts = int((start_point + timedelta(days=random.randint(0, 365), seconds=random.randint(0, 86400))).timestamp())
        
        cursor.execute("""
            INSERT INTO transactions (id, checkoutId, productId, productName, type, quantity, price, total, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), str(uuid.uuid4())[:8], str(p_id), p_name, t_type, qty, p_price, round(qty * p_price, 2), ts))

        # Update real-time counts
        if is_sale:
            cursor.execute("UPDATE products SET quantity = quantity - ?, sales_count = sales_count + ? WHERE id = ?", (qty, qty, p_id))
        else:
            cursor.execute("UPDATE products SET quantity = quantity + ? WHERE id = ?", (qty, p_id))

    conn.commit()
    conn.close()
    print("Database modification complete!")

if __name__ == "__main__":
    populate_mart_db()