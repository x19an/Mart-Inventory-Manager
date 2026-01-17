
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Product, Settings } from '../types';

interface SellProductProps {
  onSell: (idOrName: string, quantity: number) => { 
    success: boolean; 
    message: string; 
    transaction?: { product: Product; quantity: number } 
  };
  settings: Settings;
}

const SellProduct: React.FC<SellProductProps> = ({ onSell, settings }) => {
  const [idOrName, setIdOrName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState<{ text: string; success: boolean } | null>(null);
  const [lastTransaction, setLastTransaction] = useState<{ product: Product; quantity: number } | null>(null);

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOrName || !quantity) return;

    const result = onSell(idOrName, parseInt(quantity));
    setStatus({ text: result.message, success: result.success });
    
    if (result.success && result.transaction) {
      setLastTransaction(result.transaction);
      setIdOrName('');
      setQuantity('');
    } else {
      setLastTransaction(null);
    }
  };

  const printReceipt = () => {
    if (!lastTransaction) return;

    const { product, quantity } = lastTransaction;
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 160] // Slightly taller for more info
    });

    const centerX = 40;
    const now = new Date();

    // Header from Settings
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.martName.toUpperCase(), centerX, 15, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.address, centerX, 20, { align: 'center' });
    doc.text(`Contact: ${settings.contact}`, centerX, 24, { align: 'center' });
    
    doc.setLineWidth(0.3);
    doc.line(10, 28, 70, 28);

    // Date/Time
    doc.setFontSize(8);
    doc.text(`Date: ${now.toLocaleDateString()}`, 10, 35);
    doc.text(`Time: ${now.toLocaleTimeString()}`, 10, 39);

    doc.line(10, 43, 70, 43);

    // Transaction Details
    doc.setFont('helvetica', 'bold');
    doc.text('Item Details:', 10, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Product: ${product.name}`, 10, 58);
    doc.text(`ID: ${product.id}`, 10, 62);
    doc.text(`Quantity: ${quantity}`, 10, 70);
    doc.text(`Unit Price: ${settings.currency} ${product.price.toLocaleString()}`, 10, 74);

    doc.line(10, 82, 70, 82);

    // Total
    const total = product.price * quantity;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 10, 92);
    doc.text(`${settings.currency} ${total.toLocaleString()}`, 70, 92, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping with us!', centerX, 110, { align: 'center' });

    // Save PDF
    doc.save(`receipt_${product.id}_${Date.now()}.pdf`);
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl max-w-2xl">
      {status && (
        <div className={`mb-6 p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 ${
          status.success ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-red-900/20 border-red-700 text-red-400'
        }`}>
          <span className="font-medium">{status.text}</span>
          {status.success && lastTransaction && (
            <button
              onClick={printReceipt}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>🖨️</span>
              <span>Print Receipt</span>
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSell} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Product ID or Name</label>
          <input
            type="text"
            value={idOrName}
            onChange={(e) => setIdOrName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Search by ID or full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Quantity to Sell</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="0"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          Complete Sale
        </button>
      </form>
    </div>
  );
};

export default SellProduct;
