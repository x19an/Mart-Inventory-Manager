
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
 * Loads the entire database object. If it doesn't exist, creates and saves the default structure.
 */
export const loadMasterDB = (): MasterData => {
  try {
    const data = localStorage.getItem(MASTER_DB_KEY);
    if (!data) {
      // If no "db file" (LocalStorage entry) exists, create one immediately
      saveMasterDB(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    
    const parsed = JSON.parse(data);
    // Deep merge with defaults to ensure any new fields in types (like adminName) are present
    return {
      ...DEFAULT_DATA,
      ...parsed,
      settings: { 
        ...DEFAULT_DATA.settings, 
        ...(parsed.settings || {}) 
      }
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

export const clearDB = (): void => {
  localStorage.removeItem(MASTER_DB_KEY);
};
