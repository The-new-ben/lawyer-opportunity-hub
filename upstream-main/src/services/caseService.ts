export interface Case {
  id: string;
  description: string;
  opinions: { system: string; reply: string }[];
  balanced: string;
  timestamp: string;
  parties?: {
    plaintiff: string;
    defendant: string;
  };
  caseType?: string;
  status?: 'active' | 'pending' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  assignedJudge?: string;
  assignedLawyer?: string;
  courtDate?: string;
  documents?: string[];
}

const DB_NAME = 'GlobalLegalAI_v7';
const STORE_NAME = 'cases';

class CaseService {
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('caseType', 'caseType', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveCase(caseData: Case): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Ensure default values
      const caseToSave = {
        ...caseData,
        status: caseData.status || 'active',
        caseType: caseData.caseType || 'general'
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(caseToSave);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Could not save to IndexedDB:', error);
      throw error;
    }
  }

  async getAllCases(): Promise<Case[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const cases = request.result || [];
          resolve(cases);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Could not read from IndexedDB:', error);
      return [];
    }
  }

  async getCasesByStatus(status: string): Promise<Case[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('status');
        const request = index.getAll(status);
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Could not read from IndexedDB:', error);
      return [];
    }
  }

  async updateCaseStatus(id: string, status: 'active' | 'pending' | 'closed'): Promise<void> {
    try {
      const case_ = await this.getCaseById(id);
      if (case_) {
        case_.status = status;
        await this.saveCase(case_);
      }
    } catch (error) {
      console.error('Could not update case status:', error);
      throw error;
    }
  }

  async clearAllCases(): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Could not clear IndexedDB:', error);
      throw error;
    }
  }

  async getCaseById(id: string): Promise<Case | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Could not get case from IndexedDB:', error);
      return null;
    }
  }

  async deleteCase(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Could not delete case from IndexedDB:', error);
      throw error;
    }
  }
}

export const caseService = new CaseService();