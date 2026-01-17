
import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { getProductsFromDB, deleteProductFromDB, getCategoriesFromDB, addCategoryToDB, deleteCategoryFromDB } from '../db';

interface ManageDatabaseViewProps {
  onRefresh: () => void;
}

export const ManageDatabaseView: React.FC<ManageDatabaseViewProps> = ({ onRefresh }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const refreshLocal = () => {
    setProducts(getProductsFromDB());
    setCategories(getCategoriesFromDB());
    onRefresh();
  };

  useEffect(() => {
    refreshLocal();
  }, []);

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      deleteProductFromDB(id);
      refreshLocal();
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    addCategoryToDB(newCategory.trim());
    setNewCategory('');
    refreshLocal();
  };

  const handleDeleteCategory = (name: string) => {
    // Check if category is used
    const isUsed = products.some(p => p.category === name);
    if (isUsed) {
      alert("Cannot delete category while it contains products.");
      return;
    }
    if (window.confirm(`Delete category "${name}"?`)) {
      deleteCategoryFromDB(name);
      refreshLocal();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Management */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
          Predefined Categories
        </h3>
        
        <form onSubmit={handleAddCategory} className="mb-6 flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
            placeholder="New Category Name..."
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Add
          </button>
        </form>

        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {categories.map(cat => (
            <div key={cat.name} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700 group hover:border-slate-500 transition-colors">
              <span className="text-slate-200 font-medium">{cat.name}</span>
              <button 
                onClick={() => handleDeleteCategory(cat.name)}
                className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-slate-500 italic text-center py-4">No categories defined.</p>}
        </div>
      </div>

      {/* Product Management (Removal) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          Inventory Removal
        </h3>
        
        <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-2">
          {products.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-700 group hover:border-slate-500 transition-colors">
              <div>
                <p className="text-white font-bold">{p.name}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{p.id}</span>
                  <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{p.category}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteProduct(p.id, p.name)}
                className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-2 rounded-lg transition-all"
                title="Remove Product"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          ))}
          {products.length === 0 && <p className="text-slate-500 italic text-center py-8">No products in inventory.</p>}
        </div>
      </div>
    </div>
  );
};
