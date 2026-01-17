
import { MasterData, Product, Settings, Transaction } from '../types';

const MASTER_DB_KEY = 'mart_inventory_master_db';

const DEFAULT_DATA: MasterData = {
  products: [],
  categories: ['Beverages', 'Snacks', 'Dairy', 'Produce', 'Meat', 'Bakery'],
  settings: {
    martName: 'MART INVENTORY',
    adminName: 'Admin User',
    address: '123 Main Street, City',
    contact: '+1 234 567 890',
    currency: 'Rs.',
    accessPin: ''
  },
  transactions: []
};

/**
 * Loads the entire database object. If it doesn't exist, returns the default structure.
 */
export const loadMasterDB = (): MasterData => {
  try {
    const data = localStorage.getItem(MASTER_DB_KEY);
    if (!data) return DEFAULT_DATA;
    
    const parsed = JSON.parse(data);
    // Merge with defaults to ensure any new fields in types are present
    return {
      ...DEFAULT_DATA,
      ...parsed,
      settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) }
    };
  } catch (error) {
    console.error("Failed to load DB, resetting to defaults", error);
    return DEFAULT_DATA;
  }
};

/**
 * Saves the entire database object to LocalStorage.
 */
export const saveMasterDB = (data: MasterData): void => {
  try {
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save DB", error);
  }
};

// Legacy compatibility helpers if needed, but App.tsx will now mostly use loadMasterDB
export const clearDB = (): void => {
  localStorage.removeItem(MASTER_DB_KEY);
};
