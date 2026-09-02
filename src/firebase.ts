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
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { Card, CardProgress, Deck, ReviewLog, UserProfile } from './types';
import { appStorage } from './services/storage';
import { loadFullDecksAndCards, syncContentLibrary } from './services/contentSync';

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

// Helper to chunk batch writes
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

// Data synchronization service
export class DatabaseService {
  private static user: FirebaseUser | null = null;

  static setUser(user: FirebaseUser | null) {
    this.user = user;
  }

  static getUserId(): string {
    return this.user?.uid || 'local_user';
  }

  // --- Profile Storage ---
  static async getLocalProfile(userId: string = 'local_user'): Promise<UserProfile | null> {
    return appStorage.getUserProfile(userId);
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    await appStorage.saveUserProfile(profile);
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

  // --- Initialize or Seed User Data ---
  static async initializeUserData(user: FirebaseUser): Promise<{ 
    decks: Deck[]; 
    cards: Card[]; 
    profile: UserProfile 
  }> {
    const userId = user.uid;
    const userDocRef = doc(db, 'users', userId);

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
        await appStorage.saveUserProfile(profile);
      } else {
        profile = userSnap.data() as UserProfile;
        await appStorage.saveUserProfile(profile);

        // Fetch cloud progress & custom items
        try {
          const progressSnap = await getDocs(collection(db, 'users', userId, 'progress'));
          if (!progressSnap.empty) {
            const cloudProgress = progressSnap.docs.map(d => d.data() as CardProgress);
            await appStorage.saveBulkUserProgress(cloudProgress);
          } else {
            // Check legacy /users/{userId}/cards if user had cards in older schema
            const legacyCardsSnap = await getDocs(collection(db, 'users', userId, 'cards'));
            if (!legacyCardsSnap.empty) {
              const legacyCards = legacyCardsSnap.docs.map(d => d.data() as Card);
              const progressList: CardProgress[] = [];
              const itemsToWrite: Array<{ ref: any; data: any }> = [];

              for (const c of legacyCards) {
                if (c.id.startsWith('custom_card_')) {
                  await appStorage.saveCustomCard(c);
                  itemsToWrite.push({ ref: doc(db, 'users', userId, 'custom_cards', c.id), data: c });
                } else {
                  const p: CardProgress = {
                    cardId: c.id,
                    deckId: c.deckId,
                    userId,
                    state: c.state || 'new',
                    due: c.due || Date.now(),
                    interval: c.interval || 0,
                    easeFactor: c.easeFactor || 2.5,
                    repetitions: c.repetitions || 0,
                    lapses: c.lapses || 0,
                    lastReviewedAt: c.lastReviewedAt,
                    isFavorite: c.isFavorite || false,
                    updatedAt: c.updatedAt || new Date().toISOString()
                  };
                  progressList.push(p);
                  itemsToWrite.push({ ref: doc(db, 'users', userId, 'progress', p.cardId), data: p });
                }
              }

              if (progressList.length > 0) {
                await appStorage.saveBulkUserProgress(progressList);
              }
              if (itemsToWrite.length > 0) {
                await batchWriteItems(itemsToWrite);
              }
            }
          }

          // Fetch custom cards & decks
          const customCardsSnap = await getDocs(collection(db, 'users', userId, 'custom_cards'));
          for (const d of customCardsSnap.docs) {
            await appStorage.saveCustomCard(d.data() as Card);
          }

          const customDecksSnap = await getDocs(collection(db, 'users', userId, 'custom_decks'));
          for (const d of customDecksSnap.docs) {
            await appStorage.saveCustomDeck(d.data() as Deck);
          }
        } catch (syncErr) {
          console.warn('Cloud progress fetch notice:', syncErr);
        }
      }

      // Check background content updates
      await syncContentLibrary();

      // Load merged cards & decks
      const { decks, cards } = await loadFullDecksAndCards(userId);
      return { decks, cards, profile };
    } catch (err) {
      console.warn('Firestore initialization error, using local data fallback:', err);
      const { decks, cards } = await loadFullDecksAndCards(userId);

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

      await appStorage.saveUserProfile(profile);
      return { decks, cards, profile };
    }
  }

  // --- Real-time Firestore Subscriptions for Multi-device Sync ---
  static subscribeToProgress(userId: string, callback: (progress: CardProgress[]) => void) {
    if (!userId || userId === 'local_user') {
      return () => {};
    }

    const q = query(collection(db, 'users', userId, 'progress'));
    return onSnapshot(q, (snapshot) => {
      const progress = snapshot.docs.map(d => d.data() as CardProgress);
      appStorage.saveBulkUserProgress(progress);
      callback(progress);
    }, (error) => {
      console.warn('Progress snapshot error:', error);
    });
  }

  // --- CRUD for Cards ---
  static async saveCard(card: Card): Promise<void> {
    const userId = card.userId || 'local_user';
    const isCustom = card.id.startsWith('custom_card_') || card.deckId.startsWith('deck_custom_');

    if (isCustom) {
      await appStorage.saveCustomCard(card);
      if (userId && userId !== 'local_user') {
        try {
          const cardRef = doc(db, 'users', userId, 'custom_cards', card.id);
          await setDoc(cardRef, sanitizeForFirestore(card), { merge: true });
        } catch (err) {
          console.error('Failed to sync custom card to Firestore:', err);
        }
      }
    } else {
      const progress: CardProgress = {
        cardId: card.id,
        deckId: card.deckId,
        userId,
        state: card.state,
        due: card.due,
        interval: card.interval,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
        lapses: card.lapses,
        lastReviewedAt: card.lastReviewedAt,
        isFavorite: card.isFavorite || false,
        updatedAt: card.updatedAt || new Date().toISOString()
      };

      await appStorage.saveUserProgress(progress);

      if (userId && userId !== 'local_user') {
        try {
          const progressRef = doc(db, 'users', userId, 'progress', card.id);
          await setDoc(progressRef, sanitizeForFirestore(progress), { merge: true });
        } catch (err) {
          console.error('Failed to sync progress to Firestore:', err);
        }
      }
    }
  }

  static async deleteCard(cardId: string, userId: string): Promise<void> {
    await appStorage.deleteCustomCard(cardId);

    if (userId && userId !== 'local_user') {
      try {
        await deleteDoc(doc(db, 'users', userId, 'custom_cards', cardId));
        await deleteDoc(doc(db, 'users', userId, 'progress', cardId));
      } catch (err) {
        console.error('Failed to delete card from Firestore:', err);
      }
    }
  }

  // --- CRUD for Decks ---
  static async saveDeck(deck: Deck): Promise<void> {
    const userId = deck.userId || 'local_user';
    if (deck.category === 'custom' || deck.id.startsWith('deck_custom_')) {
      await appStorage.saveCustomDeck(deck);

      if (userId && userId !== 'local_user') {
        try {
          const deckRef = doc(db, 'users', userId, 'custom_decks', deck.id);
          await setDoc(deckRef, sanitizeForFirestore(deck), { merge: true });
        } catch (err) {
          console.error('Failed to sync deck to Firestore:', err);
        }
      }
    }
  }

  static async deleteDeck(deckId: string, userId: string): Promise<void> {
    await appStorage.deleteCustomDeck(deckId);

    if (userId && userId !== 'local_user') {
      try {
        await deleteDoc(doc(db, 'users', userId, 'custom_decks', deckId));
        const cardsSnap = await getDocs(query(collection(db, 'users', userId, 'custom_cards'), where('deckId', '==', deckId)));
        const batch = writeBatch(db);
        cardsSnap.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.error('Failed to delete deck from Firestore:', err);
      }
    }
  }

  // --- Record Review Log & Update User Stats ---
  static async logReview(log: ReviewLog, card: Card): Promise<void> {
    const userId = log.userId || 'local_user';
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
