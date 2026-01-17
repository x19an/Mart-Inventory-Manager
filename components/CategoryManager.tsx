
import React, { useState } from 'react';

interface CategoryManagerProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [newCategory, setNewCategory] = useState('');

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategory('');
    }
  };

  const removeCategory = (catToRemove: string) => {
    setCategories(categories.filter(cat => cat !== catToRemove));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <form onSubmit={addCategory} className="space-y-4">
          <label className="block text-sm font-medium text-slate-400">Add New Category</label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Frozen Foods"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="bg-slate-950/50 p-4 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Defined Categories</h3>
        </div>
        <div className="p-4 grid grid-cols-1 divide-y divide-slate-700">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat} className="flex items-center justify-between py-3 px-2 group hover:bg-slate-700/20 rounded transition-colors">
                <span className="text-slate-100 font-medium">{cat}</span>
                <button
                  onClick={() => removeCategory(cat)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="Remove Category"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500 italic">
              No categories defined.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
