
import { MasterData, Settings } from '../types';

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
    accessPin: '',
    apiEndpoint: 'http://127.0.0.1:5000/api',
    useExternalDB: true
  },
  transactions: []
};

/**
 * Ensures the API endpoint is correctly formatted without trailing slashes
 * and uses the stable 127.0.0.1 loopback address.
 */
const getCleanEndpoint = (base: string) => {
  if (!base) return '';
  let url = base.trim();
  url = url.replace('localhost', '127.0.0.1');
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

/**
 * Loads the database. Prioritizes the SQL backend if configured.
 */
export const loadMasterDB = async (): Promise<MasterData> => {
  const localRaw = localStorage.getItem(MASTER_DB_KEY);
  const localParsed = localRaw ? JSON.parse(localRaw) : DEFAULT_DATA;
  
  const settings: Settings = { 
    ...DEFAULT_DATA.settings, 
    ...(localParsed.settings || {}) 
  };

  if (settings.useExternalDB && settings.apiEndpoint) {
    const endpoint = getCleanEndpoint(settings.apiEndpoint);
    try {
      // Perform a health check first with a shorter timeout
      const healthCheck = await fetch(`${endpoint}/health`, { 
        method: 'GET', 
        mode: 'cors',
        signal: AbortSignal.timeout(3000) 
      });
      
      if (healthCheck.ok) {
        const response = await fetch(`${endpoint}/get-all`, {
          headers: { 'Cache-Control': 'no-cache' },
          mode: 'cors'
        });
        
        if (response.ok) {
          const remoteData = await response.json();
          console.log("[Storage] SQL Backend connected. Synchronizing data...");
          return { 
            products: remoteData.products || [],
            categories: (remoteData.categories && remoteData.categories.length > 0) ? remoteData.categories : DEFAULT_DATA.categories,
            transactions: remoteData.transactions || [],
            settings 
          };
        }
      }
    } catch (error) {
      console.warn("[Storage] SQL Backend Offline. Using LocalStorage fallback mode.");
    }
  }

  return {
    ...DEFAULT_DATA,
    ...localParsed,
    settings
  };
};

/**
 * Saves data to LocalStorage (backup) and pushes to the SQL Backend.
 */
export const saveMasterDB = async (data: MasterData): Promise<boolean> => {
  // Always update LocalStorage as a fail-safe
  try {
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("[Storage] LocalStorage backup error:", e);
  }

  if (data.settings.useExternalDB && data.settings.apiEndpoint) {
    const endpoint = getCleanEndpoint(data.settings.apiEndpoint);
    try {
      const response = await fetch(`${endpoint}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'cors',
        signal: AbortSignal.timeout(10000) 
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`[Storage] Server rejection: ${text}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("[Storage] Connection Lost: Could not reach SQL Backend at " + endpoint);
      return false;
    }
  }
  return true;
};

export const clearDB = (): void => {
  localStorage.removeItem(MASTER_DB_KEY);
};
