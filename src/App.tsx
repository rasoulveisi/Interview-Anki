import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Deck, ReviewRating, UserProfile } from './types';
import { auth, DatabaseService } from './firebase';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { calculateNextReview } from './utils/srs';
import { loadFullDecksAndCards, syncContentLibrary } from './services/contentSync';
import { appStorage } from './services/storage';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavigation } from './components/BottomNavigation';
import { DecksView } from './components/DecksView';
import { StudySessionView } from './components/StudySessionView';
import { CardEditorModal } from './components/CardEditorModal';
import { CardBrowserView } from './components/CardBrowserView';
import { StatsView } from './components/StatsView';
import { UserProfileModal } from './components/UserProfileModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentTab, setCurrentTab] = useState<'decks' | 'study' | 'add' | 'browser' | 'stats'>('decks');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  
  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [defaultDeckForNewCard, setDefaultDeckForNewCard] = useState<string | undefined>(undefined);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. Instant Cache-First Local Load (0ms startup)
  useEffect(() => {
    let isMounted = true;

    async function loadLocalFirst() {
      const localProfile = await appStorage.getUserProfile('local_user');
      if (localProfile && isMounted) {
        setProfile(localProfile);
      }

      const initial = await loadFullDecksAndCards('local_user');
      if (isMounted && initial.decks.length > 0) {
        setDecks(initial.decks);
        setCards(initial.cards);
      }
    }

    loadLocalFirst();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Online / Offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('syncing');
      syncContentLibrary().then(({ updated, decks: freshDecks }) => {
        if (updated) {
          loadFullDecksAndCards(currentUser?.uid || 'local_user').then(res => {
            setDecks(res.decks);
            setCards(res.cards);
          });
        }
        setSyncStatus('synced');
      }).catch(() => setSyncStatus('offline'));
    };

    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // 3. Initialize Firebase Auth & Cloud Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        DatabaseService.setUser(user);
        setSyncStatus('syncing');

        try {
          const { decks: initialDecks, cards: initialCards, profile: userProfile } = 
            await DatabaseService.initializeUserData(user);
          
          setDecks(initialDecks);
          setCards(initialCards);
          setProfile(userProfile);
          setSyncStatus('synced');
        } catch (err) {
          console.warn('Initial data load notice, local fallback active:', err);
          setSyncStatus('offline');
        }
      } else {
        // Sign in anonymously by default for seamless persistent cloud sync
        try {
          await signInAnonymously(auth);
        } catch (authErr) {
          console.warn('Anonymous auth offline notice:', authErr);
          setSyncStatus('offline');
          const localData = await loadFullDecksAndCards('local_user');
          setDecks(localData.decks);
          setCards(localData.cards);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 4. Real-time Progress Sync when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const unsubProgress = DatabaseService.subscribeToProgress(currentUser.uid, async () => {
      const refreshed = await loadFullDecksAndCards(currentUser.uid);
      setDecks(refreshed.decks);
      setCards(refreshed.cards);
    });

    return () => {
      unsubProgress();
    };
  }, [currentUser]);

  // Compute Total Due Count
  const now = Date.now();
  const totalDueCount = useMemo(() => {
    return cards.filter(c => c.state === 'new' || c.state === 'learning' || c.state === 'relearning' || (c.state === 'review' && c.due <= now)).length;
  }, [cards, now]);

  // SRS Card Review Handler
  const handleReviewCard = useCallback(async (card: Card, rating: ReviewRating, timeSpentMs: number) => {
    const estimate = calculateNextReview(card, rating);
    const nowTime = Date.now();

    const updatedCard: Card = {
      ...card,
      state: estimate.nextState,
      due: estimate.dueTimestamp,
      interval: estimate.nextInterval,
      easeFactor: estimate.nextEase,
      repetitions: estimate.nextReps,
      lapses: estimate.nextLapses,
      lastReviewedAt: nowTime,
      updatedAt: new Date().toISOString()
    };

    // Update in-memory state immediately (optimistic update)
    setCards(prev => prev.map(c => c.id === card.id ? updatedCard : c));

    // Log review & save progress
    const reviewLog = {
      id: `review_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser?.uid || 'local_user',
      cardId: card.id,
      deckId: card.deckId,
      rating,
      timeSpentMs,
      previousInterval: card.interval,
      newInterval: estimate.nextInterval,
      previousEase: card.easeFactor,
      newEase: estimate.nextEase,
      reviewedAt: nowTime
    };

    await DatabaseService.logReview(reviewLog, updatedCard);
  }, [currentUser]);

  // Card Management Handlers
  const handleSaveCard = async (savedCard: Card) => {
    setCards(prev => {
      const idx = prev.findIndex(c => c.id === savedCard.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedCard;
        return next;
      }
      return [savedCard, ...prev];
    });

    await DatabaseService.saveCard(savedCard);
  };

  const handleDeleteCard = async (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    await DatabaseService.deleteCard(cardId, currentUser?.uid || 'local_user');
  };

  const handleResetCardSRS = async (card: Card) => {
    const resetCard: Card = {
      ...card,
      state: 'new',
      due: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      lapses: 0,
      updatedAt: new Date().toISOString()
    };

    setCards(prev => prev.map(c => c.id === card.id ? resetCard : c));
    await DatabaseService.saveCard(resetCard);
  };

  const handleToggleSuspend = async (card: Card) => {
    const toggledCard: Card = {
      ...card,
      state: card.state === 'suspended' ? 'new' : 'suspended',
      updatedAt: new Date().toISOString()
    };

    setCards(prev => prev.map(c => c.id === card.id ? toggledCard : c));
    await DatabaseService.saveCard(toggledCard);
  };

  const handleToggleFavorite = async (card: Card) => {
    const favCard: Card = {
      ...card,
      isFavorite: !card.isFavorite,
      updatedAt: new Date().toISOString()
    };

    setCards(prev => prev.map(c => c.id === card.id ? favCard : c));
    await DatabaseService.saveCard(favCard);
  };

  // Deck Management Handlers
  const handleCreateDeck = async (deckData: { name: string; description: string; color: string }) => {
    const isoNow = new Date().toISOString();
    const newDeck: Deck = {
      id: `deck_custom_${Date.now()}`,
      userId: currentUser?.uid || 'local_user',
      name: deckData.name,
      description: deckData.description,
      category: 'custom',
      color: deckData.color,
      iconName: 'Folder',
      totalCards: 0,
      newCount: 0,
      learnCount: 0,
      reviewCount: 0,
      createdAt: isoNow,
      updatedAt: isoNow
    };

    setDecks(prev => [...prev, newDeck]);
    await DatabaseService.saveDeck(newDeck);
  };

  const handleDeleteDeck = async (deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
    setCards(prev => prev.filter(c => c.deckId !== deckId));
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(null);
    }
    await DatabaseService.deleteDeck(deckId, currentUser?.uid || 'local_user');
  };

  const handleResetDeckSRS = async (deckId: string) => {
    const nowTime = Date.now();
    const updatedCards = cards.map(c => {
      if (c.deckId === deckId) {
        return {
          ...c,
          state: 'new' as const,
          due: nowTime,
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          lapses: 0,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setCards(updatedCards);
    for (const c of updatedCards.filter(c => c.deckId === deckId)) {
      await DatabaseService.saveCard(c);
    }
  };

  // Sync / Restore All Default 27 Decks from Content Library
  const handleSyncDefaultDecks = async () => {
    setSyncStatus('syncing');
    try {
      const result = await syncContentLibrary();
      const userId = currentUser?.uid || 'local_user';
      const refreshed = await loadFullDecksAndCards(userId);
      setDecks(refreshed.decks);
      setCards(refreshed.cards);
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Sync default decks error:', err);
      setSyncStatus('offline');
    }
  };

  // Export Data as JSON Backup
  const handleExportData = () => {
    const exportPayload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      user: profile,
      decks,
      cards
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ankidroid_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Data from JSON Backup
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.cards && Array.isArray(parsed.cards)) {
          const userId = currentUser?.uid || 'local_user';
          for (const card of parsed.cards) {
            await DatabaseService.saveCard({ ...card, userId });
          }
          if (parsed.decks && Array.isArray(parsed.decks)) {
            for (const deck of parsed.decks) {
              await DatabaseService.saveDeck({ ...deck, userId });
            }
          }
          const refreshed = await loadFullDecksAndCards(userId);
          setDecks(refreshed.decks);
          setCards(refreshed.cards);
          alert(`Successfully restored ${parsed.cards.length} cards!`);
        } else {
          alert('Invalid backup format. File must contain "cards" array.');
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to parse file. Please upload a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleOpenAddCardModal = (deckId?: string) => {
    setEditingCard(null);
    setDefaultDeckForNewCard(deckId || (selectedDeck ? selectedDeck.id : decks[0]?.id));
    setIsEditorOpen(true);
  };

  const handleEditCardModal = (card: Card) => {
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      
      {/* Mobile Top Header */}
      <MobileHeader
        currentTab={currentTab}
        selectedDeck={selectedDeck}
        profile={profile}
        syncStatus={syncStatus}
        streak={profile?.streak || 1}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSelectAllDecks={() => {
          setSelectedDeck(null);
          setCurrentTab('decks');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {currentTab === 'decks' && (
          <DecksView
            decks={decks}
            cards={cards}
            onSelectDeckToStudy={(deck) => {
              setSelectedDeck(deck);
              setCurrentTab('study');
            }}
            onOpenAddCard={handleOpenAddCardModal}
            onCreateDeck={handleCreateDeck}
            onDeleteDeck={handleDeleteDeck}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onRestoreDefaultDecks={handleSyncDefaultDecks}
            onResetDeckSRS={handleResetDeckSRS}
          />
        )}

        {currentTab === 'study' && (
          <StudySessionView
            deck={selectedDeck}
            cards={cards}
            allDecks={decks}
            onSelectDeck={(d) => setSelectedDeck(d)}
            onReviewCard={handleReviewCard}
            onEditCard={handleEditCardModal}
            onToggleFavorite={handleToggleFavorite}
            onResetDeckSRS={handleResetDeckSRS}
            onBackToDecks={() => {
              setCurrentTab('decks');
            }}
          />
        )}

        {currentTab === 'browser' && (
          <CardBrowserView
            cards={cards}
            decks={decks}
            onEditCard={handleEditCardModal}
            onDeleteCard={handleDeleteCard}
            onResetCardSRS={handleResetCardSRS}
            onToggleSuspend={handleToggleSuspend}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddCard={() => handleOpenAddCardModal()}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            cards={cards}
            decks={decks}
            profile={profile}
          />
        )}
      </main>

      {/* Bottom Navigation & Indicators */}
      <OfflineIndicator />

      {/* Fixed Bottom Navigation Bar (Mobile First) */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'add') {
            handleOpenAddCardModal();
          } else {
            setCurrentTab(tab);
          }
        }}
        dueCount={totalDueCount}
      />

      {/* Card Editor / Creator Modal */}
      <CardEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        cardToEdit={editingCard}
        decks={decks}
        defaultDeckId={defaultDeckForNewCard}
        userId={currentUser?.uid || 'local_user'}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      {/* User Profile, Daily Limits & Firebase Sync Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        syncStatus={syncStatus}
        totalCards={cards.length}
        totalDecks={decks.length}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onUpdateProfile={async (updatedProfile) => {
          setProfile(updatedProfile);
          await DatabaseService.saveUserProfile(updatedProfile);
        }}
        onForceSync={async () => {
          if (currentUser) {
            setSyncStatus('syncing');
            try {
              const res = await DatabaseService.initializeUserData(currentUser);
              setDecks(res.decks);
              setCards(res.cards);
              setProfile(res.profile);
              setSyncStatus('synced');
            } catch {
              setSyncStatus('offline');
            }
          }
        }}
      />

    </div>
  );
}
