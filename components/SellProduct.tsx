
import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { Product, Settings } from '../types';

interface SellProductProps {
  products: Product[];
  onBulkSale: (items: { productId: string, quantity: number }[]) => void;
  settings: Settings;
  onViewSearch: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const SellProduct: React.FC<SellProductProps> = ({ products, onBulkSale, settings, onViewSearch }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<{ text: string; success: boolean } | null>(null);

  const filteredSearch = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      p.stock > 0
    ).slice(0, 5);
  }, [searchTerm, products]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        setStatus({ text: `Cannot add more ${product.name}. Stock limit reached.`, success: false });
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setSearchTerm('');
    setStatus(null);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, Math.min(item.product.stock, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    onBulkSale(cart.map(item => ({ productId: item.product.id, quantity: item.quantity })));
    printReceipt();
    setCart([]);
    setStatus({ text: "Sale completed and receipt generated!", success: true });
    setTimeout(() => setStatus(null), 5000);
  };

  const printReceipt = () => {
    if (cart.length === 0) return;
    const doc = new jsPDF({ unit: 'mm', format: [80, 150 + (cart.length * 10)] });
    const centerX = 40;
    const now = new Date();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.martName.toUpperCase(), centerX, 15, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.address, centerX, 20, { align: 'center' });
    doc.text(`Contact: ${settings.contact}`, centerX, 24, { align: 'center' });
    doc.line(10, 28, 70, 28);
    doc.setFontSize(8);
    doc.text(`Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 10, 35);
    doc.line(10, 40, 70, 40);

    let y = 48;
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', 10, y);
    doc.text('QTY', 45, y);
    doc.text('PRICE', 70, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 8;

    cart.forEach(item => {
      doc.text(item.product.name.substring(0, 15), 10, y);
      doc.text(item.quantity.toString(), 45, y);
      doc.text(`${settings.currency} ${(item.product.price * item.quantity).toLocaleString()}`, 70, y, { align: 'right' });
      y += 6;
    });

    doc.line(10, y + 2, 70, y + 2);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 10, y + 12);
    doc.text(`${settings.currency} ${cartTotal.toLocaleString()}`, 70, y + 12, { align: 'right' });
    doc.setFontSize(8);
    doc.text('Thank you!', centerX, y + 25, { align: 'center' });
    doc.save(`receipt_${Date.now()}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Search and Product Picker */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <label className="block text-sm font-medium text-slate-400 mb-3">Add Items to Cart</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name or Scan ID..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {filteredSearch.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-slate-800">
                {filteredSearch.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors text-left"
                  >
                    <div>
                      <div className="text-white font-bold">{p.name}</div>
                      <div className="text-slate-500 text-xs">{p.category} • {settings.currency} {p.price}</div>
                    </div>
                    <div className="text-blue-500 font-bold">Add +</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {status && (
          <div className={`p-4 rounded-xl border ${status.success ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
            {status.text}
          </div>
        )}

        {/* Catalog Shortcut */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 tracking-widest">Available Catalog</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.filter(p => p.stock > 0).slice(0, 4).map(p => (
              <button 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="flex items-center p-3 bg-slate-900 rounded-xl border border-slate-700 hover:border-blue-500 transition-all text-left"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mr-3 text-lg">📦</div>
                <div>
                  <div className="text-slate-200 text-sm font-bold truncate max-w-[120px]">{p.name}</div>
                  <div className="text-blue-400 text-xs font-mono">{settings.currency} {p.price}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={onViewSearch} className="w-full mt-6 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors border-t border-slate-700 pt-4">
            Browse Full Inventory →
          </button>
        </div>
      </div>

      {/* Cart Summary */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl flex flex-col h-[calc(100vh-200px)]">
        <div className="p-6 border-b border-slate-700 bg-slate-950/20">
          <h3 className="text-white font-bold text-lg flex items-center justify-between">
            <span>Shopping Cart</span>
            <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full">{cart.length} ITEMS</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.product.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative group">
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >✕</button>
                <div className="text-slate-100 text-sm font-bold mb-2">{item.product.name}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-700">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 text-slate-400 hover:text-white">-</button>
                    <span className="px-3 text-white font-mono text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 text-slate-400 hover:text-white">+</button>
                  </div>
                  <div className="text-green-500 font-bold font-mono">
                    {settings.currency} {(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
              <span className="text-5xl">🛒</span>
              <p className="text-sm font-medium">Cart is currently empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950/40 border-t border-slate-700 space-y-4">
          <div className="flex justify-between items-center text-slate-400 text-sm">
            <span>Subtotal</span>
            <span>{settings.currency} {cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-white font-bold text-xl">
            <span>Grand Total</span>
            <span className="text-blue-500 font-mono">{settings.currency} {cartTotal.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all ${
              cart.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            Checkout & Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellProduct;
