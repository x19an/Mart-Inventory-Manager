
import React, { useState } from 'react';
import { Product } from '../types';

interface AddProductProps {
  onAdd: (product: Omit<Product, 'id' | 'unitsSold'>) => void;
  categories: string[];
}

const AddProduct: React.FC<AddProductProps> = ({ onAdd, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || '',
    price: '',
    stock: '',
    reorderLevel: ''
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price || !formData.stock || !formData.reorderLevel) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    onAdd({
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      reorderLevel: parseInt(formData.reorderLevel)
    });

    setMessage({ text: 'Product added successfully!', type: 'success' });
    setFormData({ name: '', category: categories[0] || '', price: '', stock: '', reorderLevel: '' });
    
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl max-w-2xl">
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-red-900/20 border-red-700 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="p-6 bg-amber-900/20 border border-amber-700 text-amber-400 rounded-lg text-center">
          Please add some categories in the "Categories" tab first.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter product name"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Initial Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Reorder Level</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Minimum stock before alert"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Add Product
          </button>
        </form>
      )}
    </div>
  );
};

export default AddProduct;
