import { 
  Card, 
  CardProgress, 
  CardTemplate, 
  Deck, 
  DeckTemplate, 
  DecksManifest 
} from '../types';
import { appStorage } from './storage';
import { allQuestions, categoriesMeta } from '../data';

// Helper to hydrate an immutable CardTemplate with personal CardProgress
export function hydrateCard(
  template: CardTemplate, 
  progress?: CardProgress, 
  userId: string = 'local_user'
): Card {
  const now = Date.now();
  const isoNow = new Date().toISOString();

  return {
    id: template.id,
    userId: progress?.userId || userId,
    deckId: template.deckId,
    front: template.front,
    back: template.back,
    notes: template.notes,
    spokenTip: template.spokenTip,
    tags: template.tags || [],
    difficulty: template.difficulty || 'Intermediate',
    state: progress?.state || 'new',
    due: progress?.due || now,
    interval: progress?.interval ?? 0,
    easeFactor: progress?.easeFactor ?? 2.5,
    repetitions: progress?.repetitions ?? 0,
    lapses: progress?.lapses ?? 0,
    lastReviewedAt: progress?.lastReviewedAt,
    isFavorite: progress?.isFavorite ?? false,
    createdAt: template.createdAt || isoNow,
    updatedAt: progress?.updatedAt || template.updatedAt || isoNow
  };
}

// Helper to hydrate a DeckTemplate with live card counts
export function hydrateDeck(
  template: DeckTemplate, 
  cards: Card[], 
  userId: string = 'local_user'
): Deck {
  const isoNow = new Date().toISOString();
  const now = Date.now();
  const deckCards = cards.filter(c => c.deckId === template.id);

  const newCount = deckCards.filter(c => c.state === 'new').length;
  const learnCount = deckCards.filter(c => c.state === 'learning' || c.state === 'relearning').length;
  const reviewCount = deckCards.filter(c => c.state === 'review' && c.due <= now).length;

  return {
    id: template.id,
    userId,
    name: template.name,
    description: template.description,
    category: template.category,
    color: template.color,
    iconName: template.iconName,
    totalCards: deckCards.length,
    newCount,
    learnCount,
    reviewCount,
    isDefault: template.isDefault ?? true,
    createdAt: isoNow,
    updatedAt: isoNow
  };
}

// Fallback generator from bundled code if offline before first network fetch
function getBundledTemplates(): { decks: DeckTemplate[]; cards: CardTemplate[] } {
  const categoryIds = Object.keys(categoriesMeta);
  const nowIso = new Date().toISOString();

  const deckColorMap: Record<string, string> = {
    javascript: '#F59E0B',
    typescript: '#3B82F6',
    angular: '#EF4444',
    rxjs: '#EC4899',
    statemanagement: '#8B5CF6',
    htmlcss: '#F97316',
    browser: '#06B6D4',
    performance: '#10B981',
    architecture: '#6366F1',
    security: '#F43F5E',
    testing: '#14B8A6',
    patterns: '#A855F7',
    a11y: '#84CC16',
    tooling: '#0284C7',
    gitworkflow: '#D97706',
    fesystemdesign: '#D946EF',
    fescenarios: '#DC2626',
    reactcore: '#06B6D4',
    reactadvanced: '#2563EB',
    web: '#3B82F6',
    dotnet: '#8B5CF6',
    efcore: '#EC4899',
    sql: '#F59E0B',
    apidesign: '#10B981',
    microservices: '#06B6D4',
    systemdesign: '#6366F1',
    scenarios: '#EF4444'
  };

  const decks: DeckTemplate[] = categoryIds.map((catId) => {
    const meta = categoriesMeta[catId as keyof typeof categoriesMeta];
    const catCards = allQuestions.filter(q => q.category === catId);

    return {
      id: `deck_${catId}`,
      name: meta?.name || catId,
      description: meta?.description || `Mastery cards for ${catId}`,
      category: catId,
      color: deckColorMap[catId] || '#6366F1',
      iconName: meta?.iconName || 'Layers',
      isDefault: true,
      totalCards: catCards.length
    };
  });

  const cards: CardTemplate[] = allQuestions.map((q) => {
    const isBackend = ['web', 'dotnet', 'efcore', 'sql', 'apidesign', 'microservices', 'systemdesign', 'scenarios'].includes(q.category);
    const codeSnippet = q.example?.code || q.codeExample || '';
    const codeLang = q.example?.language || (isBackend ? 'csharp' : 'typescript');
    const codeExplanation = q.example?.explanation || '';

    let notesMarkdown = '';

    if (q.interviewAnswer) {
      notesMarkdown += `### Comprehensive Senior Answer\n${q.interviewAnswer}\n\n`;
    } else if (q.detailedExplanation) {
      notesMarkdown += `### Detailed Explanation\n${q.detailedExplanation}\n\n`;
    }

    if (codeSnippet) {
      notesMarkdown += `### Code Example\n\`\`\`${codeLang}\n${codeSnippet}\n\`\`\`\n`;
      if (codeExplanation) {
        notesMarkdown += `_${codeExplanation}_\n\n`;
      }
    }

    if (q.seniorPoint) {
      notesMarkdown += `### 💡 Senior Engine & Architecture Insight\n> ${q.seniorPoint}\n\n`;
    }

    if (q.followUps && Array.isArray(q.followUps) && q.followUps.length > 0) {
      notesMarkdown += `### 🎯 Probable Interviewer Follow-ups\n`;
      for (const fu of q.followUps) {
        notesMarkdown += `- **Q: ${fu.question}**\n  *A:* ${fu.answer}\n`;
      }
    }

    return {
      id: `card_${q.id}`,
      deckId: `deck_${q.category}`,
      front: q.question,
      back: `${q.shortAnswer}\n\n**Key Points:**\n${q.keyPointsToMention?.map(p => `- ${p}`).join('\n') || ''}`,
      notes: notesMarkdown.trim() || undefined,
      spokenTip: q.spokenTip || '',
      tags: q.tags || [q.category, q.topic || 'General'],
      difficulty: q.difficulty || 'Intermediate',
      createdAt: nowIso,
      updatedAt: nowIso
    };
  });

  return { decks, cards };
}

// Background Content Library Sync from JSON
export async function syncContentLibrary(): Promise<{
  updated: boolean;
  decks: DeckTemplate[];
  cards: CardTemplate[];
}> {
  try {
    // 1. Check cached templates in IndexedDB
    let localDecks = await appStorage.getAllDeckTemplates();
    let localCards = await appStorage.getAllCardTemplates();
    const localManifest = await appStorage.getManifest();

    // If completely empty in local storage, initialize with bundled templates first
    if (localDecks.length === 0 || localCards.length === 0) {
      const bundled = getBundledTemplates();
      localDecks = bundled.decks;
      localCards = bundled.cards;
      await appStorage.saveDeckTemplates(bundled.decks);
      await appStorage.saveCardTemplates(bundled.cards);
    }

    // 2. If offline, return cached content immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { updated: false, decks: localDecks, cards: localCards };
    }

    // 3. Fetch remote manifest with cache-busting timestamp
    const manifestUrl = `/decks/manifest.json?t=${Date.now()}`;
    const manifestRes = await fetch(manifestUrl, { cache: 'no-cache' });
    
    if (!manifestRes.ok) {
      return { updated: false, decks: localDecks, cards: localCards };
    }

    const remoteManifest = (await manifestRes.json()) as DecksManifest;

    // 4. Compare version/updatedAt
    const isNewer = !localManifest || 
      localManifest.version !== remoteManifest.version || 
      localManifest.updatedAt !== remoteManifest.updatedAt ||
      localCards.length === 0;

    if (!isNewer) {
      return { updated: false, decks: localDecks, cards: localCards };
    }

    // 5. Fetch updated content bundle
    const allDecksRes = await fetch(`/decks/all_decks.json?t=${Date.now()}`, { cache: 'no-cache' });
    if (allDecksRes.ok) {
      const allDecksData = await allDecksRes.json();
      const freshDecks: DeckTemplate[] = [];
      const freshCards: CardTemplate[] = [];

      for (const catId of Object.keys(allDecksData)) {
        const item = allDecksData[catId];
        if (item.deck) freshDecks.push(item.deck);
        if (item.cards && Array.isArray(item.cards)) {
          freshCards.push(...item.cards);
        }
      }

      // Save to IndexedDB
      await appStorage.saveDeckTemplates(freshDecks);
      await appStorage.saveCardTemplates(freshCards);
      await appStorage.saveManifest(remoteManifest);

      return { updated: true, decks: freshDecks, cards: freshCards };
    }

    return { updated: false, decks: localDecks, cards: localCards };
  } catch (err) {
    console.warn('Content library sync notice (running on local cache):', err);
    let localDecks = await appStorage.getAllDeckTemplates();
    let localCards = await appStorage.getAllCardTemplates();
    if (localDecks.length === 0 || localCards.length === 0) {
      const bundled = getBundledTemplates();
      localDecks = bundled.decks;
      localCards = bundled.cards;
    }
    return { updated: false, decks: localDecks, cards: localCards };
  }
}

// Automatic Legacy Migration from localStorage
export async function migrateLegacyData(userId: string): Promise<void> {
  try {
    const isMigrated = await appStorage.getSyncMeta('legacy_migrated_v2');
    if (isMigrated) return;

    // Check localStorage for old cards
    const rawCards = localStorage.getItem('ankidroid_cards_v2') || localStorage.getItem('ankidroid_cards_v1');
    const rawDecks = localStorage.getItem('ankidroid_decks_v2') || localStorage.getItem('ankidroid_decks_v1');

    if (rawCards) {
      const oldCards = JSON.parse(rawCards) as Card[];
      const progressList: CardProgress[] = [];
      const customCardsList: Card[] = [];

      for (const card of oldCards) {
        if (card.id.startsWith('custom_card_') || card.deckId.startsWith('deck_custom_')) {
          customCardsList.push(card);
        } else {
          progressList.push({
            cardId: card.id,
            deckId: card.deckId,
            userId: card.userId || userId,
            state: card.state || 'new',
            due: card.due || Date.now(),
            interval: card.interval || 0,
            easeFactor: card.easeFactor || 2.5,
            repetitions: card.repetitions || 0,
            lapses: card.lapses || 0,
            lastReviewedAt: card.lastReviewedAt,
            isFavorite: card.isFavorite || false,
            updatedAt: card.updatedAt || new Date().toISOString()
          });
        }
      }

      if (progressList.length > 0) {
        await appStorage.saveBulkUserProgress(progressList);
      }
      for (const customCard of customCardsList) {
        await appStorage.saveCustomCard(customCard);
      }
    }

    if (rawDecks) {
      const oldDecks = JSON.parse(rawDecks) as Deck[];
      for (const deck of oldDecks) {
        if (deck.category === 'custom' || deck.id.startsWith('deck_custom_')) {
          await appStorage.saveCustomDeck(deck);
        }
      }
    }

    await appStorage.setSyncMeta('legacy_migrated_v2', true);
  } catch (err) {
    console.warn('Legacy data migration note:', err);
  }
}

// Load Full Decks & Cards merged with User Progress
export async function loadFullDecksAndCards(userId: string): Promise<{
  decks: Deck[];
  cards: Card[];
  deckTemplates: DeckTemplate[];
  cardTemplates: CardTemplate[];
  userProgress: Record<string, CardProgress>;
}> {
  // 1. Run legacy migration if needed
  await migrateLegacyData(userId);

  // 2. Load templates from storage
  let deckTemplates = await appStorage.getAllDeckTemplates();
  let cardTemplates = await appStorage.getAllCardTemplates();

  if (deckTemplates.length === 0 || cardTemplates.length === 0) {
    const bundled = getBundledTemplates();
    deckTemplates = bundled.decks;
    cardTemplates = bundled.cards;
    await appStorage.saveDeckTemplates(bundled.decks);
    await appStorage.saveCardTemplates(bundled.cards);
  }

  // 3. Load User Progress & Custom items
  const userProgress = await appStorage.getAllUserProgress();
  const customCards = await appStorage.getAllCustomCards();
  const customDecks = await appStorage.getAllCustomDecks();

  // 4. Hydrate standard cards
  const standardCards: Card[] = cardTemplates.map(template => {
    const progress = userProgress[template.id];
    return hydrateCard(template, progress, userId);
  });

  const allCards = [...standardCards, ...customCards];

  // 5. Hydrate Decks
  const standardDecks: Deck[] = deckTemplates.map(template => {
    return hydrateDeck(template, allCards, userId);
  });

  const allDecks = [...standardDecks, ...customDecks];

  return {
    decks: allDecks,
    cards: allCards,
    deckTemplates,
    cardTemplates,
    userProgress
  };
}
