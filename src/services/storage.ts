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
  private persistenceIssue = false;
  private lastPersistenceError: string | null = null;

  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  getPersistenceMode(): 'indexeddb' | 'memory-only' {
    return this.persistenceIssue || !this.isSupported() ? 'memory-only' : 'indexeddb';
  }

  getPersistenceError(): string | null {
    return this.lastPersistenceError;
  }

  private reportPersistenceIssue(context: string, err: unknown): void {
    this.persistenceIssue = true;
    const message = err instanceof Error ? err.message : String(err);
    this.lastPersistenceError = `${context}: ${message}`;
    console.warn(`IndexedDB persistence degraded in ${context}:`, err);
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.isSupported()) {
      this.reportPersistenceIssue('support-check', new Error('IndexedDB is not supported'));
      throw new Error('IndexedDB is not supported');
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
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
        const err = request.error || new Error('Failed to open IndexedDB');
        this.reportPersistenceIssue('open', err);
        reject(err);
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
      this.reportPersistenceIssue(`transaction:${storeName}`, err);
      // Fallback for memory map
      const memoryKey = `${storeName}_items`;
      if (mode === 'readonly') {
        return (this.memoryFallback.get(memoryKey) || []) as T;
      }
      return null as any;
    }
  }

  private setDeckTemplatesFallback(decks: DeckTemplate[]): void {
    this.memoryFallback.set('deck_templates', decks);
  }

  private getDeckTemplatesFallback(): DeckTemplate[] {
    return this.memoryFallback.get('deck_templates') || [];
  }

  private setCardTemplatesFallback(cards: CardTemplate[]): void {
    this.memoryFallback.set('card_templates', cards);
  }

  private getCardTemplatesFallback(): CardTemplate[] {
    return this.memoryFallback.get('card_templates') || [];
  }

  private setManifestFallback(manifest: DecksManifest): void {
    this.memoryFallback.set('manifest', manifest);
  }

  private getManifestFallback(): DecksManifest | null {
    return this.memoryFallback.get('manifest') || null;
  }

  private setUserProgressFallback(progressList: CardProgress[]): void {
    const existing: Record<string, CardProgress> = this.memoryFallback.get('user_progress') || {};
    const merged = { ...existing };
    for (const progress of progressList) {
      merged[progress.cardId] = progress;
    }
    this.memoryFallback.set('user_progress', merged);
  }

  private getUserProgressFallback(): Record<string, CardProgress> {
    return this.memoryFallback.get('user_progress') || {};
  }

  private removeUserProgressFallback(cardId: string): void {
    const existing: Record<string, CardProgress> = this.memoryFallback.get('user_progress') || {};
    const { [cardId]: _, ...rest } = existing;
    this.memoryFallback.set('user_progress', rest);
  }

  private setCustomCardsFallback(card: Card): void {
    const existing: Card[] = this.memoryFallback.get('custom_cards') || [];
    const next = existing.filter((item) => item.id !== card.id);
    next.push(card);
    this.memoryFallback.set('custom_cards', next);
  }

  private getCustomCardsFallback(): Card[] {
    return this.memoryFallback.get('custom_cards') || [];
  }

  private removeCustomCardFallback(cardId: string): void {
    const existing: Card[] = this.memoryFallback.get('custom_cards') || [];
    this.memoryFallback.set('custom_cards', existing.filter((item) => item.id !== cardId));
  }

  private setCustomDecksFallback(deck: Deck): void {
    const existing: Deck[] = this.memoryFallback.get('custom_decks') || [];
    const next = existing.filter((item) => item.id !== deck.id);
    next.push(deck);
    this.memoryFallback.set('custom_decks', next);
  }

  private getCustomDecksFallback(): Deck[] {
    return this.memoryFallback.get('custom_decks') || [];
  }

  private removeCustomDeckFallback(deckId: string): void {
    const existing: Deck[] = this.memoryFallback.get('custom_decks') || [];
    this.memoryFallback.set('custom_decks', existing.filter((item) => item.id !== deckId));
  }

  private setProfileFallback(profile: UserProfile): void {
    this.memoryFallback.set(`profile_${profile.userId}`, profile);
  }

  private getProfileFallback(userId: string): UserProfile | null {
    return this.memoryFallback.get(`profile_${userId}`) || null;
  }

  private setSyncMetaFallback(key: string, value: any): void {
    this.memoryFallback.set(`meta_${key}`, value);
  }

  private getSyncMetaFallback(key: string): SyncMetadata | null {
    return this.memoryFallback.get(`meta_${key}`) || null;
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
    } catch (err) {
      this.reportPersistenceIssue('getManifest', err);
      return this.getManifestFallback();
    }
  }

  async saveManifest(manifest: DecksManifest): Promise<void> {
    this.setManifestFallback(manifest);
    try {
      const db = await this.getDB();
      const tx = db.transaction('manifest', 'readwrite');
      tx.objectStore('manifest').put({ id: 'current', data: manifest });
    } catch (err) {
      this.reportPersistenceIssue('saveManifest', err);
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
    } catch (err) {
      this.reportPersistenceIssue('getAllDeckTemplates', err);
      return this.getDeckTemplatesFallback();
    }
  }

  async saveDeckTemplates(decks: DeckTemplate[]): Promise<void> {
    this.setDeckTemplatesFallback(decks);
    try {
      const db = await this.getDB();
      const tx = db.transaction('deck_templates', 'readwrite');
      const store = tx.objectStore('deck_templates');
      for (const deck of decks) {
        store.put(deck);
      }
    } catch (err) {
      this.reportPersistenceIssue('saveDeckTemplates', err);
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
    } catch (err) {
      this.reportPersistenceIssue('getAllCardTemplates', err);
      return this.getCardTemplatesFallback();
    }
  }

  async saveCardTemplates(cards: CardTemplate[]): Promise<void> {
    this.setCardTemplatesFallback(cards);
    try {
      const db = await this.getDB();
      const tx = db.transaction('card_templates', 'readwrite');
      const store = tx.objectStore('card_templates');
      for (const card of cards) {
        store.put(card);
      }
    } catch (err) {
      this.reportPersistenceIssue('saveCardTemplates', err);
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
    } catch (err) {
      this.reportPersistenceIssue('getAllUserProgress', err);
      return this.getUserProgressFallback();
    }
  }

  async saveUserProgress(progress: CardProgress): Promise<void> {
    this.setUserProgressFallback([progress]);
    try {
      const db = await this.getDB();
      const tx = db.transaction('user_progress', 'readwrite');
      tx.objectStore('user_progress').put(progress);
    } catch (err) {
      this.reportPersistenceIssue('saveUserProgress', err);
    }
  }

  async saveBulkUserProgress(progressList: CardProgress[]): Promise<void> {
    this.setUserProgressFallback(progressList);
    try {
      const db = await this.getDB();
      const tx = db.transaction('user_progress', 'readwrite');
      const store = tx.objectStore('user_progress');
      for (const item of progressList) {
        store.put(item);
      }
    } catch (err) {
      this.reportPersistenceIssue('saveBulkUserProgress', err);
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
    } catch (err) {
      this.reportPersistenceIssue('getAllCustomCards', err);
      return this.getCustomCardsFallback();
    }
  }

  async saveCustomCard(card: Card): Promise<void> {
    this.setCustomCardsFallback(card);
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_cards', 'readwrite');
      tx.objectStore('custom_cards').put(card);
    } catch (err) {
      this.reportPersistenceIssue('saveCustomCard', err);
    }
  }

  async deleteCustomCard(cardId: string): Promise<void> {
    this.removeCustomCardFallback(cardId);
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_cards', 'readwrite');
      tx.objectStore('custom_cards').delete(cardId);
    } catch (err) {
      this.reportPersistenceIssue('deleteCustomCard', err);
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
    } catch (err) {
      this.reportPersistenceIssue('getAllCustomDecks', err);
      return this.getCustomDecksFallback();
    }
  }

  async saveCustomDeck(deck: Deck): Promise<void> {
    this.setCustomDecksFallback(deck);
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_decks', 'readwrite');
      tx.objectStore('custom_decks').put(deck);
    } catch (err) {
      this.reportPersistenceIssue('saveCustomDeck', err);
    }
  }

  async deleteCustomDeck(deckId: string): Promise<void> {
    this.removeCustomDeckFallback(deckId);
    try {
      const db = await this.getDB();
      const tx = db.transaction('custom_decks', 'readwrite');
      tx.objectStore('custom_decks').delete(deckId);
    } catch (err) {
      this.reportPersistenceIssue('deleteCustomDeck', err);
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
    } catch (err) {
      this.reportPersistenceIssue(`getUserProfile:${userId}`, err);
      return this.getProfileFallback(userId);
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    this.setProfileFallback(profile);
    try {
      const db = await this.getDB();
      const tx = db.transaction('user_profile', 'readwrite');
      tx.objectStore('user_profile').put(profile);
    } catch (err) {
      this.reportPersistenceIssue('saveUserProfile', err);
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
    } catch (err) {
      this.reportPersistenceIssue(`getSyncMeta:${key}`, err);
      return this.getSyncMetaFallback(key)?.value ?? null;
    }
  }

  async setSyncMeta(key: string, value: any): Promise<void> {
    this.setSyncMetaFallback(key, value);
    try {
      const db = await this.getDB();
      const tx = db.transaction('sync_metadata', 'readwrite');
      tx.objectStore('sync_metadata').put({
        key,
        value,
        updatedAt: new Date().toISOString()
      } as SyncMetadata);
    } catch (err) {
      this.reportPersistenceIssue('setSyncMeta', err);
    }
  }
}

export const appStorage = new IndexedDBStorage();
