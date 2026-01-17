# 🛒 Super Mart Inventory Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://sqlite.org/)

A professional, desktop-first web application designed for small-to-medium mart operations. This system combines the ease of a modern web interface with the reliability of a local SQL backend to manage stock, track sales, and generate real-time business analytics.

---

## ✨ Key Features

### 🖥️ High-Performance Dashboard
- **Real-time Stats:** Instant visibility into today's revenue, sales count, and total product value.
- **Low Stock Alerts:** Automated tracking of inventory levels with visual warnings when items fall below reorder points.
- **Quick Navigation:** Rapid access to common tasks like sales, stock additions, and bulk imports.

### 🧾 Smart Checkout System
- **Dynamic Search:** Find products instantly by Name or ID/Barcode scan.
- **Cart Management:** Seamlessly add, remove, and adjust quantities during checkout.
- **PDF Receipt Generation:** Automated generation of professional thermal-style receipts using `jsPDF`.

### 📦 Robust Inventory Control
- **Product Lifecycle:** Full CRUD operations for products with category tagging.
- **Bulk Import:** Add hundreds of items at once using the Batch Import grid to save time.
- **Transaction Logs:** Detailed audit trail of every sale, addition, and stock adjustment.

### 📈 Advanced Analytics
- **Sales Trends:** Interactive 7-day visualization showing daily volume for top-performing products.
- **Product Rankings:** Automatically calculated "Top 10" list based on units sold and total revenue.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via `sqlite3` and `sqlite` wrapper)
- **Utilities:** jsPDF (Receipts), Vite (Build tool), ESM.sh (Module management)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** or **yarn**

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/mart-inventory-system.git
   cd mart-inventory-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the application:**
   - On Windows: Simply double-click `run_app.bat`.
   - Manually:
     - Terminal 1: `npm run server` (Starts the SQLite bridge)
     - Terminal 2: `npm run dev` (Starts the React dashboard)

---

## 📖 How to Use

### 1. Initial Setup
Go to the **Settings** tab to configure your Mart Name, Address, and Currency. If you want to protect the system from unauthorized access, set an **Access PIN**.

### 2. Adding Stock
- For single items, use **"New Item"**.
- For initial inventory setup, use **"Bulk Add"** to copy-paste data into the grid.

### 3. Making a Sale
1. Navigate to **"Checkout"**.
2. Search for a product or scan its ID.
3. Adjust quantities and click **"Checkout & Print"**.
4. The system will automatically decrement stock and log the transaction.

### 4. Monitoring Business Health
Check the **"Analytics"** tab daily to see which products are driving your revenue and which categories need restocking.

---

## 🛡️ Data Security & Persistence
The app uses a **Dual-Sync Strategy**:
1. **Local Backup:** Data is stored in the browser's LocalStorage for immediate persistence.
2. **SQL Synchronization:** If the backend is running, data is automatically mirrored to `inventory.db`.
3. **Manual Exports:** Users can download a `.db` JSON backup or a CSV inventory report at any time from the Settings/Inventory tabs.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
