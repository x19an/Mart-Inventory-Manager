
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
import Login from './components/Login';
import { Product, View, Settings, Transaction, MasterData } from './types';
import { loadMasterDB, saveMasterDB } from './services/storageService';

const App: React.FC = () => {
  // Primary App State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings>(loadMasterDB().settings);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // UI State
  const [activeView, setActiveView] = useState<View>(View.SEARCH_PRODUCTS);
  const [isExited, setIsExited] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Used to prevent saving empty state during initialization
  const isInitialized = useRef(false);

  // Initial Load
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

  // Sync with LocalStorage whenever core state changes
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const db: MasterData = {
      products,
      categories,
      settings,
      transactions
    };
    saveMasterDB(db);
  }, [products, categories, settings, transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'unitsSold'>) => {
    const productId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const product: Product = {
      ...newProduct,
      id: productId,
      unitsSold: 0
    };
    
    setProducts(prev => [...prev, product]);
    
    addTransaction({
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

  const handleSellProduct = (productIdOrName: string, quantity: number): { success: boolean, message: string, transaction?: { product: Product, quantity: number } } => {
    const productIndex = products.findIndex(p => p.id === productIdOrName || p.name.toLowerCase() === productIdOrName.toLowerCase());
    
    if (productIndex === -1) {
      return { success: false, message: 'Product not found.' };
    }

    const product = products[productIndex];
    if (product.stock < quantity) {
      return { success: false, message: `Insufficient stock. Current stock: ${product.stock}` };
    }

    const updatedProduct = {
      ...product,
      stock: product.stock - quantity,
      unitsSold: product.unitsSold + quantity
    };
    
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));

    addTransaction({
      productId: product.id,
      productName: product.name,
      type: 'SALE',
      quantity: quantity,
      price: product.price,
      total: product.price * quantity
    });

    return { 
      success: true, 
      message: `Successfully sold ${quantity} units of ${product.name}.`,
      transaction: { product: product, quantity }
    };
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView(View.SEARCH_PRODUCTS);
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setActiveView(View.EDIT_PRODUCT);
  };

  if (isExited) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-blue-500">System Logged Out</h1>
          <p className="text-slate-400">The Mart Inventory Management System has been closed.</p>
          <button 
            onClick={() => setIsExited(false)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            Restart Application
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && settings.accessPin) {
    return (
      <Login 
        correctPin={settings.accessPin} 
        onLogin={() => setIsAuthenticated(true)} 
        martName={settings.martName}
      />
    );
  }

  return (
    <div className="flex min-h-screen min-w-[900px] bg-slate-900">
      <Sidebar 
        activeView={activeView} 
        onViewChange={(view) => {
          if (view !== View.EDIT_PRODUCT) setEditingProduct(null);
          setActiveView(view);
        }} 
        onExit={handleLogout} 
        martName={settings.martName}
      />
      
      <main className="flex-1 ml-64 p-8 bg-slate-900 overflow-y-auto">
        <header className="mb-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white border-b border-slate-700 pb-4">
            {activeView === View.EDIT_PRODUCT ? 'Edit Product' : activeView.replace('_', ' ')}
          </h2>
        </header>

        <div className="max-w-6xl mx-auto">
          {activeView === View.ADD_PRODUCT && (
            <AddProduct onAdd={handleAddProduct} categories={categories} />
          )}
          {activeView === View.SELL_PRODUCT && (
            <SellProduct onSell={handleSellProduct} settings={settings} />
          )}
          {activeView === View.SEARCH_PRODUCTS && (
            <SearchProducts products={products} onEdit={startEditing} currency={settings.currency} />
          )}
          {activeView === View.BEST_SELLERS && (
            <BestSellers products={products} transactions={transactions} currency={settings.currency} />
          )}
          {activeView === View.CATEGORIES && (
            <CategoryManager categories={categories} setCategories={setCategories} />
          )}
          {activeView === View.SETTINGS && (
            <SettingsManager settings={settings} setSettings={setSettings} />
          )}
          {activeView === View.TRANSACTION_LOG && (
            <TransactionLog transactions={transactions} settings={settings} />
          )}
          {activeView === View.EDIT_PRODUCT && editingProduct && (
            <EditProduct 
              product={editingProduct} 
              onUpdate={handleUpdateProduct} 
              onCancel={() => setActiveView(View.SEARCH_PRODUCTS)} 
              categories={categories}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
