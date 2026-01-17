
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderLevel: number;
  unitsSold: number;
}

export interface Transaction {
  id: string;
  checkoutId: string; // Grouping ID for multi-item sales
  productId: string;
  productName: string;
  type: 'SALE' | 'STOCK_ADD' | 'STOCK_ADJUST';
  quantity: number;
  price?: number;
  total?: number;
  timestamp: number;
}

export interface Settings {
  martName: string;
  address: string;
  contact: string;
  currency: string;
  accessPin: string;
}

export interface MasterData {
  products: Product[];
  categories: string[];
  settings: Settings;
  transactions: Transaction[];
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  ADD_PRODUCT = 'ADD_PRODUCT',
  SELL_PRODUCT = 'SELL_PRODUCT',
  SEARCH_PRODUCTS = 'SEARCH_PRODUCTS',
  BEST_SELLERS = 'BEST_SELLERS',
  EDIT_PRODUCT = 'EDIT_PRODUCT',
  CATEGORIES = 'CATEGORIES',
  SETTINGS = 'SETTINGS',
  TRANSACTION_LOG = 'TRANSACTION_LOG',
  EXIT = 'EXIT'
}
