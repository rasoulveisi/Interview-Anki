import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { Card, Deck, ReviewLog, UserProfile } from './types';
import { allQuestions, categoriesMeta } from './data';

// Resolve configuration: environment variables (.env / .env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderKeyForLocalDev0000',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Use standard (default) database unless explicitly specified
const customDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = customDbId && customDbId !== '(default)'
  ? getFirestore(app, customDbId)
  : getFirestore(app);

const LOCAL_STORAGE_DECKS_KEY = 'ankidroid_decks_v2';
const LOCAL_STORAGE_CARDS_KEY = 'ankidroid_cards_v2';
const LOCAL_STORAGE_USER_KEY = 'ankidroid_user_v2';

// Helper to sanitize objects for Firestore (removes undefined fields which Firestore rejects)
function sanitizeForFirestore<T extends Record<string, any>>(data: T): T {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = sanitizeForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean as T;
}

// Helper to chunk batch writes to avoid Firestore 500 limits (parallelized)
async function batchWriteItems(items: Array<{ ref: any; data: any }>) {
  if (!items || items.length === 0) return;
  const chunkSize = 400;
  const chunks: Array<Array<{ ref: any; data: any }>> = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(item.ref, sanitizeForFirestore(item.data), { merge: true });
      }
      return batch.commit();
    })
  );
}

// Seed default decks and cards from data directory if new user
export function generateDefaultDecksAndCards(userId: string): { decks: Deck[]; cards: Card[] } {
  const categoryIds = Object.keys(categoriesMeta);
  const now = Date.now();
  const isoNow = new Date().toISOString();

  const deckColorMap: Record<string, string> = {
    // Frontend Decks
    javascript: '#F59E0B', // Amber
    typescript: '#3B82F6', // Blue
    angular: '#EF4444', // Red
    rxjs: '#EC4899', // Pink
    statemanagement: '#8B5CF6', // Purple
    htmlcss: '#F97316', // Orange
    browser: '#06B6D4', // Cyan
    performance: '#10B981', // Emerald
    architecture: '#6366F1', // Indigo
    security: '#F43F5E', // Rose
    testing: '#14B8A6', // Teal
    patterns: '#A855F7', // Violet
    a11y: '#84CC16', // Lime
    tooling: '#0284C7', // Sky
    gitworkflow: '#D97706', // Amber-dark
    fesystemdesign: '#D946EF', // Fuchsia
    fescenarios: '#DC2626', // Red-dark
    reactcore: '#06B6D4', // Cyan
    reactadvanced: '#2563EB', // Blue-dark
    // Backend Decks
    web: '#3B82F6', // Blue
    dotnet: '#8B5CF6', // Purple
    efcore: '#EC4899', // Pink
    sql: '#F59E0B', // Amber
    apidesign: '#10B981', // Emerald
    microservices: '#06B6D4', // Cyan
    systemdesign: '#6366F1', // Indigo
    scenarios: '#EF4444' // Red
  };

  const decks: Deck[] = categoryIds.map((catId) => {
    const meta = categoriesMeta[catId as keyof typeof categoriesMeta];
    const catCards = allQuestions.filter(q => q.category === catId);

    return {
      id: `deck_${catId}`,
      userId,
      name: meta?.name || catId,
      description: meta?.description || `Mastery cards for ${catId}`,
      category: catId,
      color: deckColorMap[catId] || '#6366F1',
      iconName: meta?.iconName || 'Layers',
      totalCards: catCards.length,
      newCount: catCards.length,
      learnCount: 0,
      reviewCount: 0,
      isDefault: true,
      createdAt: isoNow,
      updatedAt: isoNow
    };
  });

  const cards: Card[] = allQuestions.map((q, idx) => {
    const isBackend = ['web', 'dotnet', 'efcore', 'sql', 'apidesign', 'microservices', 'systemdesign', 'scenarios'].includes(q.category);
    const lang = isBackend ? 'csharp' : 'typescript';

    return {
      id: `card_${q.id}`,
      userId,
      deckId: `deck_${q.category}`,
      front: q.question,
      back: `${q.shortAnswer}\n\n**Key Points:**\n${q.keyPointsToMention?.map(p => `- ${p}`).join('\n') || ''}`,
      notes: q.detailedExplanation ? `### Detailed Explanation\n${q.detailedExplanation}\n\n${q.codeExample ? '```' + lang + '\n' + q.codeExample + '\n```' : ''}` : '',
      spokenTip: q.spokenTip || '',
      tags: [q.category, q.topic || 'General'],
      difficulty: q.difficulty || 'Intermediate',
      state: 'new',
      due: now + idx * 60000, // staggered initial due times
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      lapses: 0,
      isFavorite: false,
      createdAt: isoNow,
      updatedAt: isoNow
    };
  });

  return { decks, cards };
}

// Data synchronization service
export class DatabaseService {
  private static user: FirebaseUser | null = null;

  static setUser(user: FirebaseUser | null) {
    this.user = user;
  }

  static getUserId(): string {
    return this.user?.uid || 'local_user';
  }

  // Load from local storage fallback
  static getLocalDecks(): Deck[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_DECKS_KEY);
      if (data) return JSON.parse(data);
      // Check legacy v1 key if present
      const legacy = localStorage.getItem('ankidroid_decks_v1');
      return legacy ? JSON.parse(legacy) : [];
    } catch {
      return [];
    }
  }

  static saveLocalDecks(decks: Deck[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_DECKS_KEY, JSON.stringify(decks));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  static getLocalCards(): Card[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_CARDS_KEY);
      if (data) return JSON.parse(data);
      const legacy = localStorage.getItem('ankidroid_cards_v1');
      return legacy ? JSON.parse(legacy) : [];
    } catch {
      return [];
    }
  }

  static saveLocalCards(cards: Card[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_CARDS_KEY, JSON.stringify(cards));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  static getLocalProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static saveLocalProfile(profile: UserProfile) {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    this.saveLocalProfile(profile);
    const userId = profile.userId;
    if (userId && userId !== 'local_user') {
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, sanitizeForFirestore(profile), { merge: true });
      } catch (err) {
        console.warn('Failed to sync profile to Firestore:', err);
      }
    }
  }

  // Initialize or Seed Firestore
  static async initializeUserData(user: FirebaseUser): Promise<{ decks: Deck[]; cards: Card[]; profile: UserProfile }> {
    const userId = user.uid;
    const userDocRef = doc(db, 'users', userId);
    const { decks: defaultDecks, cards: defaultCards } = generateDefaultDecksAndCards(userId);

    try {
      const userSnap = await getDoc(userDocRef);
      let profile: UserProfile;

      if (!userSnap.exists()) {
        profile = {
          userId,
          displayName: user.displayName || (user.isAnonymous ? 'Mobile Explorer' : user.email?.split('@')[0] || 'Anki Scholar'),
          email: user.email || '',
          isAnonymous: user.isAnonymous,
          dailyNewLimit: 20,
          dailyReviewLimit: 100,
          streak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
          totalReviews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, sanitizeForFirestore(profile));

        // Seed all default decks & cards in batch
        const itemsToWrite: Array<{ ref: any; data: any }> = [];
        defaultDecks.forEach((deck) => {
          itemsToWrite.push({ ref: doc(db, 'users', userId, 'decks', deck.id), data: deck });
        });
        defaultCards.forEach((card) => {
          itemsToWrite.push({ ref: doc(db, 'users', userId, 'cards', card.id), data: card });
        });
        await batchWriteItems(itemsToWrite);

        this.saveLocalDecks(defaultDecks);
        this.saveLocalCards(defaultCards);

        return { decks: defaultDecks, cards: defaultCards, profile };
      } else {
        profile = userSnap.data() as UserProfile;

        // Fetch existing decks and cards from Firestore
        const decksSnap = await getDocs(collection(db, 'users', userId, 'decks'));
        let existingDecks = decksSnap.docs.map(d => d.data() as Deck);

        const cardsSnap = await getDocs(collection(db, 'users', userId, 'cards'));
        let existingCards = cardsSnap.docs.map(c => c.data() as Card);

        // Check if any default decks or cards are missing (e.g. newly added Frontend decks)
        const existingDeckIds = new Set(existingDecks.map(d => d.id));
        const existingCardIds = new Set(existingCards.map(c => c.id));

        const missingDecks = defaultDecks.filter(d => !existingDeckIds.has(d.id));
        const missingCards = defaultCards.filter(c => !existingCardIds.has(c.id));

        if (missingDecks.length > 0 || missingCards.length > 0) {
          const itemsToWrite: Array<{ ref: any; data: any }> = [];
          missingDecks.forEach((deck) => {
            itemsToWrite.push({ ref: doc(db, 'users', userId, 'decks', deck.id), data: deck });
          });
          missingCards.forEach((card) => {
            itemsToWrite.push({ ref: doc(db, 'users', userId, 'cards', card.id), data: card });
          });

          await batchWriteItems(itemsToWrite);

          existingDecks = [...existingDecks, ...missingDecks];
          existingCards = [...existingCards, ...missingCards];
        }

        this.saveLocalDecks(existingDecks);
        this.saveLocalCards(existingCards);

        return { decks: existingDecks, cards: existingCards, profile };
      }
    } catch (err) {
      console.warn('Firestore initialization error, using local data fallback:', err);
      let localDecks = this.getLocalDecks();
      let localCards = this.getLocalCards();

      const existingDeckIds = new Set(localDecks.map(d => d.id));
      const existingCardIds = new Set(localCards.map(c => c.id));

      const missingDecks = defaultDecks.filter(d => !existingDeckIds.has(d.id));
      const missingCards = defaultCards.filter(c => !existingCardIds.has(c.id));

      if (missingDecks.length > 0 || missingCards.length > 0) {
        localDecks = [...localDecks, ...missingDecks];
        localCards = [...localCards, ...missingCards];
        this.saveLocalDecks(localDecks);
        this.saveLocalCards(localCards);
      }

      const profile: UserProfile = {
        userId,
        displayName: user.displayName || (user.isAnonymous ? 'Offline User' : 'Anki Scholar'),
        email: user.email || undefined,
        isAnonymous: user.isAnonymous,
        dailyNewLimit: 20,
        dailyReviewLimit: 100,
        streak: 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
        totalReviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { decks: localDecks, cards: localCards, profile };
    }
  }

  // Explicit sync / restore of all 27 default interview decks
  static async syncAllDefaultDecks(userId: string): Promise<{ decks: Deck[]; cards: Card[] }> {
    const { decks: defaultDecks, cards: defaultCards } = generateDefaultDecksAndCards(userId);
    let currentDecks = this.getLocalDecks();
    let currentCards = this.getLocalCards();

    const existingDeckIds = new Set(currentDecks.map(d => d.id));
    const existingCardIds = new Set(currentCards.map(c => c.id));

    const missingDecks = defaultDecks.filter(d => !existingDeckIds.has(d.id));
    const missingCards = defaultCards.filter(c => !existingCardIds.has(c.id));

    const mergedCards = [...currentCards, ...missingCards];
    const mergedDecks = defaultDecks.map(d => {
      const count = mergedCards.filter(c => c.deckId === d.id).length;
      return {
        ...d,
        totalCards: count,
        newCount: count
      };
    });

    this.saveLocalDecks(mergedDecks);
    this.saveLocalCards(mergedCards);

    if (userId && userId !== 'local_user') {
      try {
        const itemsToWrite: Array<{ ref: any; data: any }> = [];
        defaultDecks.forEach(deck => {
          itemsToWrite.push({ ref: doc(db, 'users', userId, 'decks', deck.id), data: deck });
        });
        defaultCards.forEach(card => {
          itemsToWrite.push({ ref: doc(db, 'users', userId, 'cards', card.id), data: card });
        });
        await batchWriteItems(itemsToWrite);
      } catch (err) {
        console.warn('Sync all default decks to firestore warning:', err);
      }
    }

    return { decks: mergedDecks, cards: mergedCards };
  }

  // Real-time Listeners
  static subscribeToDecks(userId: string, callback: (decks: Deck[]) => void) {
    if (!userId || userId === 'local_user') {
      callback(this.getLocalDecks());
      return () => {};
    }

    const q = query(collection(db, 'users', userId, 'decks'));
    return onSnapshot(q, (snapshot) => {
      const decks = snapshot.docs.map(d => d.data() as Deck);
      this.saveLocalDecks(decks);
      callback(decks);
    }, (error) => {
      console.warn('Decks snapshot error, using cached:', error);
      callback(this.getLocalDecks());
    });
  }

  static subscribeToCards(userId: string, callback: (cards: Card[]) => void) {
    if (!userId || userId === 'local_user') {
      callback(this.getLocalCards());
      return () => {};
    }

    const q = query(collection(db, 'users', userId, 'cards'));
    return onSnapshot(q, (snapshot) => {
      const cards = snapshot.docs.map(c => c.data() as Card);
      this.saveLocalCards(cards);
      callback(cards);
    }, (error) => {
      console.warn('Cards snapshot error, using cached:', error);
      callback(this.getLocalCards());
    });
  }

  // CRUD for Cards
  static async saveCard(card: Card): Promise<void> {
    const userId = card.userId;
    // Update local cache first for instant responsiveness
    const localCards = this.getLocalCards();
    const existingIdx = localCards.findIndex(c => c.id === card.id);
    if (existingIdx >= 0) {
      localCards[existingIdx] = card;
    } else {
      localCards.unshift(card);
    }
    this.saveLocalCards(localCards);

    // Save to Firestore
    if (userId && userId !== 'local_user') {
      try {
        const cardRef = doc(db, 'users', userId, 'cards', card.id);
        await setDoc(cardRef, sanitizeForFirestore(card), { merge: true });
      } catch (err) {
        console.error('Failed to sync card to Firestore:', err);
      }
    }
  }

  static async deleteCard(cardId: string, userId: string): Promise<void> {
    const localCards = this.getLocalCards().filter(c => c.id !== cardId);
    this.saveLocalCards(localCards);

    if (userId && userId !== 'local_user') {
      try {
        await deleteDoc(doc(db, 'users', userId, 'cards', cardId));
      } catch (err) {
        console.error('Failed to delete card from Firestore:', err);
      }
    }
  }

  // CRUD for Decks
  static async saveDeck(deck: Deck): Promise<void> {
    const userId = deck.userId;
    const localDecks = this.getLocalDecks();
    const existingIdx = localDecks.findIndex(d => d.id === deck.id);
    if (existingIdx >= 0) {
      localDecks[existingIdx] = deck;
    } else {
      localDecks.unshift(deck);
    }
    this.saveLocalDecks(localDecks);

    if (userId && userId !== 'local_user') {
      try {
        const deckRef = doc(db, 'users', userId, 'decks', deck.id);
        await setDoc(deckRef, sanitizeForFirestore(deck), { merge: true });
      } catch (err) {
        console.error('Failed to sync deck to Firestore:', err);
      }
    }
  }

  static async deleteDeck(deckId: string, userId: string): Promise<void> {
    const localDecks = this.getLocalDecks().filter(d => d.id !== deckId);
    const localCards = this.getLocalCards().filter(c => c.deckId !== deckId);
    this.saveLocalDecks(localDecks);
    this.saveLocalCards(localCards);

    if (userId && userId !== 'local_user') {
      try {
        await deleteDoc(doc(db, 'users', userId, 'decks', deckId));
        // Delete all cards in deck
        const cardsSnap = await getDocs(query(collection(db, 'users', userId, 'cards'), where('deckId', '==', deckId)));
        const batch = writeBatch(db);
        cardsSnap.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.error('Failed to delete deck from Firestore:', err);
      }
    }
  }

  // Record Review Log & Update User Stats
  static async logReview(log: ReviewLog, card: Card): Promise<void> {
    const userId = log.userId;
    await this.saveCard(card);

    if (userId && userId !== 'local_user') {
      try {
        const logRef = doc(db, 'users', userId, 'reviews', log.id);
        await setDoc(logRef, sanitizeForFirestore(log));

        // Update streak & count on user doc
        const userRef = doc(db, 'users', userId);
        const today = new Date().toISOString().split('T')[0];
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const u = userSnap.data() as UserProfile;
          let newStreak = u.streak || 1;
          if (u.lastStudyDate !== today) {
            newStreak = (u.lastStudyDate === new Date(Date.now() - 86400000).toISOString().split('T')[0])
              ? newStreak + 1
              : 1;
          }
          await updateDoc(userRef, {
            totalReviews: (u.totalReviews || 0) + 1,
            streak: newStreak,
            lastStudyDate: today,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Failed to log review to Firestore:', err);
      }
    }
  }
}
