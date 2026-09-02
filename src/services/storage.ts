import { Card, CardProgress, CardTemplate, Deck, DeckTemplate, DecksManifest, UserProfile } from '../types';

const DB_NAME = 'InterviewAnkiDB_v2';
const DB_VERSION = 1;

interface SyncMetadata {
  key: string;
  value: any;
  updatedAt: string;
}

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: Map<string, any> = new Map();

  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.isSupported()) {
      throw new Error('IndexedDB is not supported');
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Stores
        if (!db.objectStoreNames.contains('manifest')) {
          db.createObjectStore('manifest', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('deck_templates')) {
          db.createObjectStore('deck_templates', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('card_templates')) {
          const cardStore = db.createObjectStore('card_templates', { keyPath: 'id' });
          cardStore.createIndex('deckId', 'deckId', { unique: false });
        }
        if (!db.objectStoreNames.contains('user_progress')) {
          const progressStore = db.createObjectStore('user_progress', { keyPath: 'cardId' });
          progressStore.createIndex('deckId', 'deckId', { unique: false });
        }
        if (!db.objectStoreNames.contains('custom_cards')) {
          const customCardStore = db.createObjectStore('custom_cards', { keyPath: 'id' });
          customCardStore.createIndex('deckId', 'deckId', { unique: false });
        }
        if (!db.objectStoreNames.contains('custom_decks')) {
          db.createObjectStore('custom_decks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('user_profile')) {
          db.createObjectStore('user_profile', { keyPath: 'userId' });
        }
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T> | IDBRequest
  ): Promise<T> {
    try {
      const db = await this.getDB();
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);

        let result: any;
        const opResult = operation(store);

        if (opResult && 'onsuccess' in opResult) {
          opResult.onsuccess = () => {
            result = opResult.result;
          };
          opResult.onerror = () => {
            reject(opResult.error);
          };
        }

        tx.oncomplete = () => {
          resolve(result);
        };
        tx.onerror = () => {
          reject(tx.error);
        };
      });
    } catch (err) {
      console.warn(`IndexedDB operation failed on ${storeName}:`, err);
      // Fallback for memory map
      const memoryKey = `${storeName}_items`;
      if (mode === 'readonly') {
        return (this.memoryFallback.get(memoryKey) || []) as T;
      }
      return null as any;
    }
  }

  // --- Manifest Storage ---
  async getManifest(): Promise<DecksManifest | null> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('manifest', 'readonly');
        const store = tx.objectStore('manifest');
        const req = store.get('current');
        req.onsuccess = () => resolve(req.result?.data || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return this.memoryFallback.get('manifest') || null;
    }
  }

  async saveManifest(manifest: DecksManifest): Promise<void> {
    this.memoryFallback.set('manifest', manifest);
    try {
      const db = await this.getDB();
      const tx = db.transaction('manifest', 'readwrite');
      tx.objectStore('manifest').put({ id: 'current', data: manifest });
    } catch (err) {
      console.warn('Failed to save manifest to IndexedDB:', err);
    }
  }

  // --- Deck Templates ---
  async getAllDeckTemplates(): Promise<DeckTemplate[]> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('deck_templates', 'readonly');
        const store = tx.objectStore('deck_templates');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return this.memoryFallback.get('deck_templates') || [];
    }
  }

  async saveDeckTemplates(decks: DeckTemplate[]): Promise<void> {
    this.memoryFallback.set('deck_templates', decks);
    try {
      const db = await this.getDB();
      const tx = db.transaction('deck_templates', 'readwrite');
      const store = tx.objectStore('deck_templates');
      for (const deck of decks) {
        store.put(deck);
      }
    } catch (err) {
      console.warn('Failed to save deck templates to IndexedDB:', err);
    }
  }

  // --- Card Templates ---
  async getAllCardTemplates(): Promise<CardTemplate[]> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('card_templates', 'readonly');
        const store = tx.objectStore('card_templates');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return this.memoryFallback.get('card_templates') || [];
    }
  }

  async saveCardTemplates(cards: CardTemplate[]): Promise<void> {
    this.memoryFallback.set('card_templates', cards);
    try {
      const db = await this.getDB();
      const tx = db.transaction('card_templates', 'readwrite');
      const store = tx.objectStore('card_templates');
      for (const card of cards) {
        store.put(card);
      }
    } catch (err) {
      console.warn('Failed to save card templates to IndexedDB:', err);
    }
  }

  // --- User Progress Storage ---
  async getAllUserProgress(): Promise<Record<string, CardProgress>> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('user_progress', 'readonly');
        const store = tx.objectStore('user_progress');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result as CardProgress[] || [];
          const map: Record<string, CardProgress> = {};
          for (const item of list) {
            map[item.cardId] = item;
          }
          resolve(map);
        };
        req.onerror = () => resolve({});
      });
    } catch {
      return this.memoryFallback.get('user_progress') || {};
    }
  }

  async saveUserProgress(progress: CardProgress): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('user_progress', 'readwrite');
      tx.objectStore('user_progress').put(progress);
    } catch (err) {
      console.warn('Failed to save user progress:', err);
    }
  }

  async saveBulkUserProgress(progressList: CardProgress[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('user_progress', 'readwrite');
      const store = tx.objectStore('user_progress');
      for (const item of progressList) {
        store.put(item);
      }
    } catch (err) {
      console.warn('Failed to save bulk user progress:', err);
    }
  }

  // --- Custom Cards (User Created) ---
  async getAllCustomCards(): Promise<Card[]> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('custom_cards', 'readonly');
        const store = tx.objectStore('custom_cards');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return this.memoryFallback.get('custom_cards') || [];
    }
  }

  async saveCustomCard(card: Card): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_cards', 'readwrite');
      tx.objectStore('custom_cards').put(card);
    } catch (err) {
      console.warn('Failed to save custom card:', err);
    }
  }

  async deleteCustomCard(cardId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_cards', 'readwrite');
      tx.objectStore('custom_cards').delete(cardId);
    } catch (err) {
      console.warn('Failed to delete custom card:', err);
    }
  }

  // --- Custom Decks (User Created) ---
  async getAllCustomDecks(): Promise<Deck[]> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('custom_decks', 'readonly');
        const store = tx.objectStore('custom_decks');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return this.memoryFallback.get('custom_decks') || [];
    }
  }

  async saveCustomDeck(deck: Deck): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_decks', 'readwrite');
      tx.objectStore('custom_decks').put(deck);
    } catch (err) {
      console.warn('Failed to save custom deck:', err);
    }
  }

  async deleteCustomDeck(deckId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_decks', 'readwrite');
      tx.objectStore('custom_decks').delete(deckId);
    } catch (err) {
      console.warn('Failed to delete custom deck:', err);
    }
  }

  // --- User Profile ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('user_profile', 'readonly');
        const store = tx.objectStore('user_profile');
        const req = store.get(userId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return this.memoryFallback.get(`profile_${userId}`) || null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    this.memoryFallback.set(`profile_${profile.userId}`, profile);
    try {
      const db = await this.getDB();
      const tx = db.transaction('user_profile', 'readwrite');
      tx.objectStore('user_profile').put(profile);
    } catch (err) {
      console.warn('Failed to save profile:', err);
    }
  }

  // --- Sync Metadata ---
  async getSyncMeta(key: string): Promise<any | null> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction('sync_metadata', 'readonly');
        const store = tx.objectStore('sync_metadata');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result?.value ?? null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return this.memoryFallback.get(`meta_${key}`) || null;
    }
  }

  async setSyncMeta(key: string, value: any): Promise<void> {
    this.memoryFallback.set(`meta_${key}`, value);
    try {
      const db = await this.getDB();
      const tx = db.transaction('sync_metadata', 'readwrite');
      tx.objectStore('sync_metadata').put({
        key,
        value,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to set sync meta:', err);
    }
  }
}

export const appStorage = new IndexedDBStorage();
