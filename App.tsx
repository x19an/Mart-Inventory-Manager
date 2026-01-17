
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AddProduct from './components/AddProduct';
import SellProduct from './components/SellProduct';
import SearchProducts from './components/SearchProducts';
import BestSellers from './components/BestSellers';
import EditProduct from './components/EditProduct';
import CategoryManager from './components/CategoryManager';
import SettingsManager from './components/SettingsManager';
import TransactionLog from './components/TransactionLog';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { Product, View, Settings, Transaction, MasterData } from './types';
import { loadMasterDB, saveMasterDB } from './services/storageService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings>(loadMasterDB().settings);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [isExited, setIsExited] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const isInitialized = useRef(false);

  useEffect(() => {
    const db = loadMasterDB();
    setProducts(db.products);
    setCategories(db.categories);
    setSettings(db.settings);
    setTransactions(db.transactions);
    
    if (!db.settings.accessPin) {
      setIsAuthenticated(true);
    }
    
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    const db: MasterData = { products, categories, settings, transactions };
    saveMasterDB(db);
  }, [products, categories, settings, transactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'unitsSold'>) => {
    const productId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const product: Product = { ...newProduct, id: productId, unitsSold: 0 };
    setProducts(prev => [...prev, product]);
    
    addTransaction({
      checkoutId: 'STOCK-' + Date.now(),
      productId: productId,
      productName: product.name,
      type: 'STOCK_ADD',
      quantity: product.stock,
      total: product.price * product.stock
    });
    setActiveView(View.SEARCH_PRODUCTS);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const oldProduct = products.find(p => p.id === updatedProduct.id);
    if (oldProduct && oldProduct.stock !== updatedProduct.stock) {
      const diff = updatedProduct.stock - oldProduct.stock;
      addTransaction({
        checkoutId: 'ADJ-' + Date.now(),
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        type: 'STOCK_ADJUST',
        quantity: Math.abs(diff),
        total: updatedProduct.price * Math.abs(diff)
      });
    }
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setActiveView(View.SEARCH_PRODUCTS);
  };

  const handleBulkSale = (saleItems: { productId: string, quantity: number }[]) => {
    const checkoutId = 'SALE-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const updatedProducts = [...products];
    const newLogs: Transaction[] = [];

    saleItems.forEach(item => {
      const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
      if (pIdx !== -1) {
        const product = updatedProducts[pIdx];
        updatedProducts[pIdx] = {
          ...product,
          stock: product.stock - item.quantity,
          unitsSold: product.unitsSold + item.quantity
        };
        newLogs.push({
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          checkoutId,
          productId: product.id,
          productName: product.name,
          type: 'SALE',
          quantity: item.quantity,
          price: product.price,
          total: product.price * item.quantity,
          timestamp: Date.now()
        });
      }
    });

    setProducts(updatedProducts);
    setTransactions(prev => [...newLogs, ...prev]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView(View.DASHBOARD);
  };

  if (isExited) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">System Logged Out</h1>
        <button onClick={() => setIsExited(false)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">Restart</button>
      </div>
    );
  }

  if (!isAuthenticated && settings.accessPin) {
    return <Login correctPin={settings.accessPin} onLogin={() => setIsAuthenticated(true)} martName={settings.martName} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onExit={handleLogout} martName={settings.martName} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="mb-8 max-w-6xl mx-auto flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">
            {activeView === View.EDIT_PRODUCT ? 'Edit Product' : activeView.replace('_', ' ')}
          </h2>
          {activeView === View.SEARCH_PRODUCTS && (
            <button 
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + ["ID,Name,Category,Price,Stock,Sold"].join(",") + "\n"
                  + products.map(p => `${p.id},${p.name},${p.category},${p.price},${p.stock},${p.unitsSold}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "inventory.csv");
                document.body.appendChild(link);
                link.click();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all border border-slate-700"
            >
              📥 Export CSV
            </button>
          )}
        </header>

        <div className="max-w-6xl mx-auto">
          {activeView === View.DASHBOARD && (
            <Dashboard 
              products={products} 
              transactions={transactions} 
              settings={settings} 
              onViewChange={setActiveView} 
            />
          )}
          {activeView === View.ADD_PRODUCT && <AddProduct onAdd={handleAddProduct} categories={categories} />}
          {activeView === View.SELL_PRODUCT && (
            <SellProduct 
              products={products} 
              onBulkSale={handleBulkSale} 
              settings={settings} 
              onViewSearch={() => setActiveView(View.SEARCH_PRODUCTS)}
            />
          )}
          {activeView === View.SEARCH_PRODUCTS && (
            <SearchProducts products={products} onEdit={(p) => {setEditingProduct(p); setActiveView(View.EDIT_PRODUCT);}} currency={settings.currency} />
          )}
          {activeView === View.BEST_SELLERS && <BestSellers products={products} transactions={transactions} currency={settings.currency} />}
          {activeView === View.CATEGORIES && <CategoryManager categories={categories} setCategories={setCategories} />}
          {activeView === View.SETTINGS && <SettingsManager settings={settings} setSettings={setSettings} />}
          {activeView === View.TRANSACTION_LOG && <TransactionLog transactions={transactions} settings={settings} />}
          {activeView === View.EDIT_PRODUCT && editingProduct && (
            <EditProduct product={editingProduct} onUpdate={handleUpdateProduct} onCancel={() => setActiveView(View.SEARCH_PRODUCTS)} categories={categories} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
