
import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { getCategoriesFromDB } from '../db';

interface AddProductViewProps {
  onAdd: (product: Omit<Product, 'id' | 'salesCount'>) => void;
}

export const AddProductView: React.FC<AddProductViewProps> = ({ onAdd }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    reorderLevel: '',
  });
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  useEffect(() => {
    const cats = getCategoriesFromDB();
    setCategories(cats);
    if (cats.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: cats[0].name }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price || !formData.quantity || !formData.reorderLevel) {
      setStatus({ message: "Please fill in all fields.", type: 'error' });
      return;
    }

    onAdd({
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      reorderLevel: parseInt(formData.reorderLevel),
    });

    setStatus({ message: "Product added successfully!", type: 'success' });
    setFormData({ name: '', category: categories[0]?.name || '', price: '', quantity: '', reorderLevel: '' });
    setTimeout(() => setStatus({ message: '', type: null }), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-slate-700 pb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Product Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="e.g. Arabica Coffee"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
          >
            {categories.length === 0 ? (
              <option disabled>No categories predefined</option>
            ) : (
              categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))
            )}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-rose-400 mt-1 italic">Please add categories in Manage Database first.</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
            <input
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Reorder Level</label>
            <input
              name="reorderLevel"
              type="number"
              value={formData.reorderLevel}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={categories.length === 0}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
        >
          Add Product
        </button>

        {status.message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium text-center transition-all ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
};
