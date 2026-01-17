import sqlite3
import customtkinter as ctk
from tkinter import messagebox

# Set theme and appearance
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class Database:
    def __init__(self):
        self.conn = sqlite3.connect('inventory.db')
        self.cursor = self.conn.cursor()
        self.setup()

    def setup(self):
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS categories (name TEXT PRIMARY KEY)''')
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS products (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                name TEXT NOT NULL,
                                category TEXT NOT NULL,
                                price REAL NOT NULL,
                                quantity INTEGER NOT NULL,
                                reorder_level INTEGER NOT NULL,
                                sales_count INTEGER DEFAULT 0,
                                FOREIGN KEY(category) REFERENCES categories(name))''')
        
        # Seed initial categories if empty
        self.cursor.execute("SELECT COUNT(*) FROM categories")
        if self.cursor.fetchone()[0] == 0:
            cats = [('Groceries',), ('Bakery',), ('Dairy',), ('Confectionery',), ('Beverages',), ('Electronics',)]
            self.cursor.executemany("INSERT INTO categories VALUES (?)", cats)
        self.conn.commit()

    def get_categories(self):
        self.cursor.execute("SELECT name FROM categories ORDER BY name ASC")
        return [row[0] for row in self.cursor.fetchall()]

    def add_category(self, name):
        try:
            self.cursor.execute("INSERT INTO categories VALUES (?)", (name,))
            self.conn.commit()
            return True
        except:
            return False

    def delete_category(self, name):
        try:
            self.cursor.execute("DELETE FROM categories WHERE name = ?", (name,))
            self.conn.commit()
            return True
        except:
            return False

    def add_product(self, name, category, price, quantity, reorder):
        self.cursor.execute("INSERT INTO products (name, category, price, quantity, reorder_level) VALUES (?, ?, ?, ?, ?)",
                            (name, category, price, quantity, reorder))
        self.conn.commit()

    def sell_product(self, search_term, qty):
        # Search by ID or Name
        self.cursor.execute("SELECT id, name, quantity, sales_count FROM products WHERE id = ? OR name = ?", (search_term, search_term))
        res = self.cursor.fetchone()
        if not res:
            return False, "Product not found."
        
        p_id, p_name, p_qty, p_sales = res
        if p_qty < qty:
            return False, f"Insufficient stock. Current: {p_qty}"
        
        self.cursor.execute("UPDATE products SET quantity = ?, sales_count = ? WHERE id = ?", (p_qty - qty, p_sales + qty, p_id))
        self.conn.commit()
        return True, f"Sold {qty} units of {p_name}."

    def get_products(self, search=""):
        if search:
            self.cursor.execute("SELECT * FROM products WHERE name LIKE ? OR category LIKE ?", (f'%{search}%', f'%{search}%'))
        else:
            self.cursor.execute("SELECT * FROM products")
        return self.cursor.fetchall()

    def get_best_sellers(self):
        self.cursor.execute("SELECT name, category, sales_count, (sales_count * price) FROM products ORDER BY sales_count DESC")
        return self.cursor.fetchall()

    def delete_product(self, p_id):
        self.cursor.execute("DELETE FROM products WHERE id = ?", (p_id,))
        self.conn.commit()

class InventoryApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Mart Inventory Management System")
        self.geometry("1000x600")
        self.db = Database()

        # Layout
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Sidebar
        self.sidebar = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        
        self.logo_label = ctk.CTkLabel(self.sidebar, text="MART SYSTEM", font=ctk.CTkFont(size=20, weight="bold"))
        self.logo_label.pack(pady=30, padx=20)

        self.btn_search = self.create_nav_btn("Search Products", self.show_search_view)
        self.btn_add = self.create_nav_btn("Add Product", self.show_add_view)
        self.btn_sell = self.create_nav_btn("Sell Product", self.show_sell_view)
        self.btn_best = self.create_nav_btn("Best Sellers", self.show_best_view)
        self.btn_manage = self.create_nav_btn("Manage Database", self.show_manage_view)
        self.btn_exit = self.create_nav_btn("Exit", self.quit, fg_color="#991b1b", hover_color="#7f1d1d")

        # Main Content Area
        self.content_frame = ctk.CTkFrame(self, corner_radius=0, fg_color="transparent")
        self.content_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        
        self.show_search_view()

    def create_nav_btn(self, text, command, **kwargs):
        btn = ctk.CTkButton(self.sidebar, text=text, command=command, corner_radius=10, height=40, font=ctk.CTkFont(weight="bold"), **kwargs)
        btn.pack(pady=10, padx=20, fill="x")
        return btn

    def clear_content(self):
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def show_search_view(self):
        self.clear_content()
        header = ctk.CTkLabel(self.content_frame, text="Product Inventory", font=ctk.CTkFont(size=24, weight="bold"))
        header.pack(pady=(0, 20), anchor="w")

        search_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        search_frame.pack(fill="x", pady=10)

        entry_search = ctk.CTkEntry(search_frame, placeholder_text="Search by name or category...", width=400)
        entry_search.pack(side="left", padx=(0, 10))

        def run_search():
            results = self.db.get_products(entry_search.get())
            update_table(results)

        btn_run = ctk.CTkButton(search_frame, text="Search", command=run_search, width=100)
        btn_run.pack(side="left")

        # Scrollable Table
        scroll_frame = ctk.CTkScrollableFrame(self.content_frame, label_text="Results")
        scroll_frame.pack(fill="both", expand=True, pady=10)

        def update_table(data):
            for widget in scroll_frame.winfo_children():
                widget.destroy()
            
            # Header
            headers = ["ID", "Name", "Category", "Price", "Qty", "Reorder"]
            for i, h in enumerate(headers):
                lbl = ctk.CTkLabel(scroll_frame, text=h, font=ctk.CTkFont(weight="bold"), text_color="#3b82f6")
                lbl.grid(row=0, column=i, padx=20, pady=5, sticky="w")

            for idx, row in enumerate(data):
                for col_idx, val in enumerate(row[:-1]): # Exclude sales_count
                    color = "white"
                    if col_idx == 4 and val <= row[5]: # Qty <= Reorder
                        color = "#f87171"
                    lbl = ctk.CTkLabel(scroll_frame, text=str(val), text_color=color)
                    lbl.grid(row=idx+1, column=col_idx, padx=20, pady=2, sticky="w")

        update_table(self.db.get_products())

    def show_add_view(self):
        self.clear_content()
        header = ctk.CTkLabel(self.content_frame, text="Add New Product", font=ctk.CTkFont(size=24, weight="bold"))
        header.pack(pady=(0, 20), anchor="w")

        form = ctk.CTkFrame(self.content_frame, width=500)
        form.pack(pady=20, padx=20)

        ctk.CTkLabel(form, text="Product Name").grid(row=0, column=0, padx=20, pady=10, sticky="w")
        name_entry = ctk.CTkEntry(form, width=250)
        name_entry.grid(row=0, column=1, padx=20, pady=10)

        ctk.CTkLabel(form, text="Category").grid(row=1, column=0, padx=20, pady=10, sticky="w")
        cats = self.db.get_categories()
        cat_menu = ctk.CTkOptionMenu(form, values=cats if cats else ["No categories"], width=250)
        cat_menu.grid(row=1, column=1, padx=20, pady=10)

        ctk.CTkLabel(form, text="Price ($)").grid(row=2, column=0, padx=20, pady=10, sticky="w")
        price_entry = ctk.CTkEntry(form, width=250)
        price_entry.grid(row=2, column=1, padx=20, pady=10)

        ctk.CTkLabel(form, text="Initial Quantity").grid(row=3, column=0, padx=20, pady=10, sticky="w")
        qty_entry = ctk.CTkEntry(form, width=250)
        qty_entry.grid(row=3, column=1, padx=20, pady=10)

        ctk.CTkLabel(form, text="Reorder Level").grid(row=4, column=0, padx=20, pady=10, sticky="w")
        reorder_entry = ctk.CTkEntry(form, width=250)
        reorder_entry.grid(row=4, column=1, padx=20, pady=10)

        status_label = ctk.CTkLabel(self.content_frame, text="")
        status_label.pack(pady=10)

        def submit():
            try:
                self.db.add_product(name_entry.get(), cat_menu.get(), float(price_entry.get()), int(qty_entry.get()), int(reorder_entry.get()))
                status_label.configure(text="Success: Product added to inventory!", text_color="#4ade80")
                name_entry.delete(0, 'end')
                price_entry.delete(0, 'end')
                qty_entry.delete(0, 'end')
                reorder_entry.delete(0, 'end')
            except Exception as e:
                status_label.configure(text=f"Error: {str(e)}", text_color="#f87171")

        ctk.CTkButton(self.content_frame, text="Add Product", command=submit, width=200, height=45).pack(pady=20)

    def show_sell_view(self):
        self.clear_content()
        header = ctk.CTkLabel(self.content_frame, text="Sell Product", font=ctk.CTkFont(size=24, weight="bold"))
        header.pack(pady=(0, 20), anchor="w")

        form = ctk.CTkFrame(self.content_frame, width=500)
        form.pack(pady=20, padx=20)

        ctk.CTkLabel(form, text="Product ID or Name").grid(row=0, column=0, padx=20, pady=10, sticky="w")
        id_entry = ctk.CTkEntry(form, width=250)
        id_entry.grid(row=0, column=1, padx=20, pady=10)

        ctk.CTkLabel(form, text="Quantity to Sell").grid(row=1, column=0, padx=20, pady=10, sticky="w")
        qty_entry = ctk.CTkEntry(form, width=250)
        qty_entry.grid(row=1, column=1, padx=20, pady=10)

        status_label = ctk.CTkLabel(self.content_frame, text="")
        status_label.pack(pady=10)

        def process():
            try:
                success, msg = self.db.sell_product(id_entry.get(), int(qty_entry.get()))
                if success:
                    status_label.configure(text=msg, text_color="#4ade80")
                    id_entry.delete(0, 'end')
                    qty_entry.delete(0, 'end')
                else:
                    status_label.configure(text=msg, text_color="#f87171")
            except:
                status_label.configure(text="Error: Please enter a valid quantity.", text_color="#f87171")

        ctk.CTkButton(self.content_frame, text="Confirm Sale", command=process, width=200, height=45, fg_color="#10b981", hover_color="#059669").pack(pady=20)

    def show_best_view(self):
        self.clear_content()
        header = ctk.CTkLabel(self.content_frame, text="Best Selling Products", font=ctk.CTkFont(size=24, weight="bold"))
        header.pack(pady=(0, 20), anchor="w")

        scroll_frame = ctk.CTkScrollableFrame(self.content_frame, label_text="Analytics")
        scroll_frame.pack(fill="both", expand=True, pady=10)

        headers = ["Rank", "Product Name", "Category", "Units Sold", "Total Revenue"]
        for i, h in enumerate(headers):
            ctk.CTkLabel(scroll_frame, text=h, font=ctk.CTkFont(weight="bold"), text_color="#3b82f6").grid(row=0, column=i, padx=20, pady=5, sticky="w")

        data = self.db.get_best_sellers()
        for idx, row in enumerate(data):
            ctk.CTkLabel(scroll_frame, text=f"#{idx+1}").grid(row=idx+1, column=0, padx=20, pady=2, sticky="w")
            ctk.CTkLabel(scroll_frame, text=row[0]).grid(row=idx+1, column=1, padx=20, pady=2, sticky="w")
            ctk.CTkLabel(scroll_frame, text=row[1]).grid(row=idx+1, column=2, padx=20, pady=2, sticky="w")
            ctk.CTkLabel(scroll_frame, text=str(row[2]), font=ctk.CTkFont(weight="bold")).grid(row=idx+1, column=3, padx=20, pady=2, sticky="w")
            ctk.CTkLabel(scroll_frame, text=f"${row[3]:.2f}", text_color="#4ade80").grid(row=idx+1, column=4, padx=20, pady=2, sticky="w")

    def show_manage_view(self):
        self.clear_content()
        header = ctk.CTkLabel(self.content_frame, text="Manage Database", font=ctk.CTkFont(size=24, weight="bold"))
        header.pack(pady=(0, 20), anchor="w")

        main_split = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        main_split.pack(fill="both", expand=True)

        # Left Column: Categories
        cat_frame = ctk.CTkFrame(main_split)
        cat_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))
        ctk.CTkLabel(cat_frame, text="Categories", font=ctk.CTkFont(weight="bold")).pack(pady=10)
        
        entry_cat = ctk.CTkEntry(cat_frame, placeholder_text="New Category Name...")
        entry_cat.pack(pady=5, padx=20, fill="x")

        def add_cat():
            if self.db.add_category(entry_cat.get()):
                entry_cat.delete(0, 'end')
                self.show_manage_view()

        ctk.CTkButton(cat_frame, text="Add Category", command=add_cat).pack(pady=5, padx=20, fill="x")
        
        cat_scroll = ctk.CTkScrollableFrame(cat_frame, height=200)
        cat_scroll.pack(fill="both", expand=True, padx=10, pady=10)

        for c in self.db.get_categories():
            f = ctk.CTkFrame(cat_scroll, fg_color="transparent")
            f.pack(fill="x", pady=2)
            ctk.CTkLabel(f, text=c).pack(side="left")
            ctk.CTkButton(f, text="X", width=30, height=20, fg_color="#ef4444", hover_color="#dc2626", 
                          command=lambda name=c: [self.db.delete_category(name), self.show_manage_view()]).pack(side="right")

        # Right Column: Delete Products
        prod_frame = ctk.CTkFrame(main_split)
        prod_frame.pack(side="right", fill="both", expand=True, padx=(10, 0))
        ctk.CTkLabel(prod_frame, text="Remove Inventory Items", font=ctk.CTkFont(weight="bold")).pack(pady=10)
        
        prod_scroll = ctk.CTkScrollableFrame(prod_frame)
        prod_scroll.pack(fill="both", expand=True, padx=10, pady=10)

        for p in self.db.get_products():
            f = ctk.CTkFrame(prod_scroll, fg_color="transparent")
            f.pack(fill="x", pady=2)
            ctk.CTkLabel(f, text=f"{p[1]} ({p[2]})").pack(side="left")
            ctk.CTkButton(f, text="Delete", width=60, height=20, fg_color="#ef4444", hover_color="#dc2626",
                          command=lambda pid=p[0]: [self.db.delete_product(pid), self.show_manage_view()]).pack(side="right")

if __name__ == "__main__":
    app = InventoryApp()
    app.mainloop()
